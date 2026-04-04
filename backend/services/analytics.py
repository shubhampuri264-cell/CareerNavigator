from database import supabase_admin


async def record_assessment_event(assessment_id: str, event_type: str) -> None:
    """Log an assessment lifecycle event (started, completed)."""
    print(f"[ANALYTICS] Event '{event_type}' for assessment {assessment_id}")


async def get_admin_summary() -> dict:
    """Return a live summary for the admin analytics endpoint."""
    try:
        sessions = supabase_admin.table("sessions").select("id").execute()
        total_sessions = len(sessions.data or [])

        assessments = supabase_admin.table("assessments").select(
            "id, recommended_role, status"
        ).execute()
        rows = assessments.data or []
        completed = [r for r in rows if r.get("status") == "completed"]

        role_distribution: dict = {"PM": 0, "SWE": 0, "ML": 0, "Data": 0}
        for r in completed:
            role = r.get("recommended_role")
            if role in role_distribution:
                role_distribution[role] += 1

        completion_rate = round(len(completed) / len(rows), 2) if rows else 0.0

        feedback = supabase_admin.table("feedback").select("rating, accuracy").execute()
        feedback_rows = feedback.data or []
        ratings = [f["rating"] for f in feedback_rows if f.get("rating")]
        avg_rating = round(sum(ratings) / len(ratings), 1) if ratings else None

        return {
            "total_sessions": total_sessions,
            "total_assessments": len(rows),
            "completed_assessments": len(completed),
            "completion_rate": completion_rate,
            "role_distribution": role_distribution,
            "total_feedback": len(feedback_rows),
            "avg_rating": avg_rating,
        }
    except Exception as e:
        print(f"[ANALYTICS] Error computing summary: {e}")
        return {
            "total_sessions": 0,
            "total_assessments": 0,
            "completed_assessments": 0,
            "completion_rate": 0.0,
            "role_distribution": {"PM": 0, "SWE": 0, "ML": 0, "Data": 0},
            "total_feedback": 0,
            "avg_rating": None,
        }
