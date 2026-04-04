import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from database import supabase_admin
from models import FeedbackCreateRequest, FeedbackResponse
from services.email import send_results_email, schedule_followup_email

router = APIRouter(prefix="/api/feedback", tags=["feedback"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.post("", response_model=FeedbackResponse, status_code=201)
async def submit_feedback(body: FeedbackCreateRequest):
    """
    Save user feedback for a completed assessment.
    If email_requested is True, sends results email immediately and schedules
    a 14-day follow-up check-in.
    """
    # Verify the assessment exists
    assessment = (
        supabase_admin.table("assessments")
        .select("id, recommended_role, scores, session_id")
        .eq("id", body.assessment_id)
        .maybe_single()
        .execute()
    )
    if not assessment.data:
        raise HTTPException(status_code=404, detail="Assessment not found")

    feedback_id = str(uuid.uuid4())
    row = {
        "id": feedback_id,
        "assessment_id": body.assessment_id,
        "session_id": body.session_id,
        "rating": body.rating,
        "accuracy": body.accuracy,
        "response": body.response,
        "email_requested": body.email_requested,
        "created_at": _now_iso(),
    }

    result = supabase_admin.table("feedback").insert(row).execute()
    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to save feedback")

    # Send email if requested
    if body.email_requested:
        # Resolve email: use override if provided, else fall back to session email
        email_to = body.email_override
        name = "there"

        if not email_to:
            session = (
                supabase_admin.table("sessions")
                .select("name, email")
                .eq("id", body.session_id)
                .maybe_single()
                .execute()
            )
            if session.data:
                email_to = session.data.get("email")
                name = session.data.get("name", "there")

        if email_to:
            await send_results_email(
                to_email=email_to,
                name=name,
                recommended_role=assessment.data.get("recommended_role", ""),
                scores=assessment.data.get("scores", {}),
                assessment_id=body.assessment_id,
            )
            schedule_followup_email(
                to_email=email_to,
                name=name,
                assessment_id=body.assessment_id,
            )

    return result.data[0]
