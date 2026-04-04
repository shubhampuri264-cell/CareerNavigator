from pydantic import BaseModel, field_validator
from typing import Optional, Dict, List


# ─────────────────────────────────────────────
# Sessions (replaces Auth — no login required)
# ─────────────────────────────────────────────

class SessionCreateRequest(BaseModel):
    name: str
    email: Optional[str] = None

    @field_validator("name")
    @classmethod
    def validate_name(cls, v: str) -> str:
        v = v.strip()
        if not v:
            raise ValueError("Name is required")
        return v

    @field_validator("email")
    @classmethod
    def clean_email(cls, v: Optional[str]) -> Optional[str]:
        if v is not None:
            v = v.strip()
            return v if v else None
        return None


class SessionResponse(BaseModel):
    id: str
    name: str
    email: Optional[str] = None
    created_at: str


# ─────────────────────────────────────────────
# Assessments
# ─────────────────────────────────────────────

class AssessmentStartRequest(BaseModel):
    session_id: str
    pre_confidence: int = 5

    @field_validator("pre_confidence")
    @classmethod
    def validate_pre_confidence(cls, v: int) -> int:
        if not 1 <= v <= 10:
            raise ValueError("pre_confidence must be between 1 and 10")
        return v


class AssessmentSubmitRequest(BaseModel):
    assessment_id: str
    answers: Dict[str, int]  # {"q1": 3, "q2": 5, ...}

    @field_validator("answers")
    @classmethod
    def validate_answers(cls, v: Dict[str, int]) -> Dict[str, int]:
        if len(v) != 15:
            raise ValueError(f"Must provide exactly 15 answers, got {len(v)}")
        for key, val in v.items():
            if not 1 <= val <= 5:
                raise ValueError(f"Answer for {key} must be between 1 and 5")
        return v


class ScoreResult(BaseModel):
    PM: int
    SWE: int
    ML: int
    Data: int


class AIRecommendation(BaseModel):
    rank: int            # 1 = best match
    role: str            # "PM" | "SWE" | "ML" | "Data"
    title: str           # Full role title
    fit_score: int       # 0–100
    reason: str          # Gemini-generated explanation


class AssessmentResponse(BaseModel):
    id: str
    session_id: Optional[str] = None
    pre_confidence: int
    answers: Optional[Dict[str, int]] = None
    scores: Optional[Dict[str, int]] = None
    recommended_role: Optional[str] = None
    ai_recommendations: Optional[List[AIRecommendation]] = None
    status: str
    created_at: str
    completed_at: Optional[str] = None


# ─────────────────────────────────────────────
# Resources
# ─────────────────────────────────────────────

class ResourceResponse(BaseModel):
    id: str
    role: str
    title: str
    url: str
    description: Optional[str] = None
    resource_type: str   # "course" | "article" | "video" | "book"
    difficulty: str      # "beginner" | "intermediate" | "advanced"


# ─────────────────────────────────────────────
# Feedback
# ─────────────────────────────────────────────

class FeedbackCreateRequest(BaseModel):
    assessment_id: str
    session_id: str
    rating: int           # 1–5 stars
    accuracy: str         # "yes" | "somewhat" | "no"
    response: Optional[str] = None
    email_requested: bool = False
    email_override: Optional[str] = None  # user can enter/change email in the feedback form

    @field_validator("rating")
    @classmethod
    def validate_rating(cls, v: int) -> int:
        if not 1 <= v <= 5:
            raise ValueError("Rating must be between 1 and 5")
        return v

    @field_validator("accuracy")
    @classmethod
    def validate_accuracy(cls, v: str) -> str:
        if v not in ("yes", "somewhat", "no"):
            raise ValueError("accuracy must be 'yes', 'somewhat', or 'no'")
        return v


class FeedbackResponse(BaseModel):
    id: str
    assessment_id: str
    session_id: str
    rating: int
    accuracy: str
    response: Optional[str] = None
    email_requested: bool
    created_at: str


# ─────────────────────────────────────────────
# Analytics (internal)
# ─────────────────────────────────────────────

class AnalyticsResponse(BaseModel):
    total_sessions: int
    total_assessments: int
    role_distribution: Dict[str, int]
