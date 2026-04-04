import uuid
from datetime import datetime, timezone

from fastapi import APIRouter, HTTPException

from database import supabase_admin
from models import SessionCreateRequest, SessionResponse

router = APIRouter(prefix="/api/sessions", tags=["sessions"])


def _now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


@router.post("", response_model=SessionResponse, status_code=201)
async def create_session(body: SessionCreateRequest):
    """
    Create a guest session — no account or password required.
    Name is required; email is optional (used only to email results).
    Returns a session_id that the frontend stores locally.
    """
    session_id = str(uuid.uuid4())
    row = {
        "id": session_id,
        "name": body.name,
        "email": body.email,
        "created_at": _now_iso(),
    }

    result = supabase_admin.table("sessions").insert(row).execute()

    if not result.data:
        raise HTTPException(status_code=500, detail="Failed to create session")

    return result.data[0]
