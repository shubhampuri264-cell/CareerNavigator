import asyncio
import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from database import supabase_admin
from models import (
    AssessmentStartRequest,
    AssessmentSubmitRequest,
    AssessmentResponse,
)
from services.scoring import calculate_scores, get_recommended_role
from services.analytics import record_assessment_event
from services.gemini import get_ai_recommendations
from services.email import send_results_email, schedule_followup_email

router = APIRouter(prefix="/api/assessments", tags=["assessments"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.post("/start", response_model=AssessmentResponse, status_code=201)
async def start_assessment(body: AssessmentStartRequest):
    """
    Create a new in-progress assessment tied to a guest session.
    No authentication required — session_id links this to the visitor.
    """
    assessment_id = str(uuid.uuid4())
    row = {
        "id": assessment_id,
        "session_id": body.session_id,
        "pre_confidence": body.pre_confidence,
        "status": "in_progress",
        "created_at": _now_iso(),
    }

    result = supabase_admin.table("assessments").insert(row).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create assessment")

    await record_assessment_event(assessment_id, "started")
    return result.data[0]


@router.post("/submit", response_model=AssessmentResponse)
async def submit_assessment(body: AssessmentSubmitRequest):
    """
    Submit answers, run scoring + AI analysis, persist results.
    If the session has an email address, results are emailed immediately
    and a 14-day follow-up is scheduled.
    """
    existing = (
        supabase_admin.table("assessments")
        .select("*")
        .eq("id", body.assessment_id)
        .maybe_single()
        .execute()
    )

    if not existing.data:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if existing.data["status"] == "completed":
        raise HTTPException(status_code=409, detail="Assessment has already been submitted")

    scores = calculate_scores(body.answers)
    recommended = get_recommended_role(scores)

    # Gemini AI analysis — falls back to [] on any failure
    ai_recs = await get_ai_recommendations(body.answers)

    update_payload = {
        "answers": body.answers,
        "scores": scores,
        "recommended_role": recommended,
        "status": "completed",
        "completed_at": _now_iso(),
    }
    if ai_recs:
        update_payload["ai_recommendations"] = ai_recs

    updated = (
        supabase_admin.table("assessments")
        .update(update_payload)
        .eq("id", body.assessment_id)
        .execute()
    )

    if not updated.data:
        raise HTTPException(status_code=500, detail="Failed to save assessment results")

    await record_assessment_event(body.assessment_id, "completed")

    # Fire-and-forget results email if session has an email address
    session_id = existing.data.get("session_id")
    if session_id:
        asyncio.create_task(
            _maybe_send_email(session_id, recommended, scores, body.assessment_id)
        )

    return updated.data[0]


async def _maybe_send_email(
    session_id: str,
    recommended_role: str,
    scores: dict,
    assessment_id: str,
) -> None:
    """Send results email if the session has an email address."""
    try:
        session = (
            supabase_admin.table("sessions")
            .select("name, email")
            .eq("id", session_id)
            .maybe_single()
            .execute()
        )
        if session.data and session.data.get("email"):
            email = session.data["email"]
            name = session.data.get("name", "there")
            await send_results_email(email, name, recommended_role, scores, assessment_id)
            schedule_followup_email(email, name, assessment_id)
    except Exception as e:
        print(f"[ASSESSMENT] Email task failed for session {session_id}: {e}")


@router.get("/{assessment_id}", response_model=AssessmentResponse)
async def get_assessment(assessment_id: str):
    """Retrieve a completed assessment by ID."""
    result = (
        supabase_admin.table("assessments")
        .select("*")
        .eq("id", assessment_id)
        .maybe_single()
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=404, detail="Assessment not found")

    return result.data
