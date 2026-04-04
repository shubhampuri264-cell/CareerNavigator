import uuid
from datetime import datetime, timezone
from typing import List

from fastapi import APIRouter, Depends, HTTPException

from auth import get_current_user
from database import supabase_admin
from models import OutcomeRequest, OutcomeResponse

router = APIRouter(prefix="/api/outcomes", tags=["outcomes"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.post("/", response_model=OutcomeResponse, status_code=201)
async def create_outcome(
    body: OutcomeRequest,
    current_user: dict = Depends(get_current_user),
):
    """
    Record post-assessment confidence rating.
    Automatically computes the confidence delta (post - pre).
    One outcome per assessment is expected but not strictly enforced.
    """
    # Fetch assessment to get pre_confidence and verify ownership
    assessment = (
        supabase_admin.table("assessments")
        .select("id, user_id, pre_confidence")
        .eq("id", body.assessment_id)
        .maybe_single()
        .execute()
    )

    if not assessment.data:
        raise HTTPException(status_code=404, detail="Assessment not found")

    if assessment.data["user_id"] != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    if assessment.data.get("pre_confidence") is None:
        raise HTTPException(
            status_code=422,
            detail="Assessment has no pre_confidence recorded",
        )

    delta = body.post_confidence - assessment.data["pre_confidence"]

    result = (
        supabase_admin.table("user_outcomes")
        .insert(
            {
                "id": str(uuid.uuid4()),
                "user_id": current_user["user_id"],
                "assessment_id": body.assessment_id,
                "post_confidence": body.post_confidence,
                "confidence_delta": delta,
                "created_at": _now_iso(),
            }
        )
        .execute()
    )

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to record outcome")

    return result.data[0]


@router.get("/user/{user_id}", response_model=List[OutcomeResponse])
async def get_outcomes(
    user_id: str,
    current_user: dict = Depends(get_current_user),
):
    """Return all outcomes for the authenticated user, newest first."""
    if user_id != current_user["user_id"]:
        raise HTTPException(status_code=403, detail="Not authorized")

    result = (
        supabase_admin.table("user_outcomes")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", desc=True)
        .execute()
    )

    return result.data or []
