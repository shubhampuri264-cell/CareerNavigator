from typing import List

from fastapi import APIRouter, HTTPException

from database import supabase_admin
from models import ResourceResponse

router = APIRouter(prefix="/api/resources", tags=["resources"])

VALID_ROLES = {"PM", "SWE", "ML", "Data"}


@router.get("/{role}", response_model=List[ResourceResponse])
async def get_resources(role: str):
    """
    Return curated learning resources for a given role.
    No authentication required.
    Results ordered by difficulty: beginner → intermediate → advanced.
    """
    if role not in VALID_ROLES:
        raise HTTPException(
            status_code=400,
            detail=f"Invalid role '{role}'. Must be one of: {sorted(VALID_ROLES)}",
        )

    result = (
        supabase_admin.table("role_resources")
        .select("*")
        .eq("role", role)
        .order("difficulty")
        .execute()
    )

    return result.data or []
