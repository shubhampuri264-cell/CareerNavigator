# ─────────────────────────────────────────────────────────────────────────────
# Scoring Engine
#
# IMPORTANT: QUESTION_WEIGHTS must stay in sync with
# frontend/src/data/questions.js by index position.
# If you add or reorder questions, update both files together.
# ─────────────────────────────────────────────────────────────────────────────

from typing import Dict, List

# Each dict maps role → weight for one question (index matches question order).
# Weights do not need to sum to 1.0 — normalization is applied after accumulation.
QUESTION_WEIGHTS: List[Dict[str, float]] = [
    # q1: Preferred problem-solving approach
    {"PM": 0.4, "SWE": 0.2, "ML": 0.2, "Data": 0.2},
    # q2: Most energizing activity
    {"PM": 0.5, "SWE": 0.1, "ML": 0.2, "Data": 0.2},
    # q3: Comfort writing code from scratch
    {"PM": 0.1, "SWE": 0.5, "ML": 0.3, "Data": 0.1},
    # q4: Working with large datasets / databases
    {"PM": 0.1, "SWE": 0.1, "ML": 0.3, "Data": 0.5},
    # q5: Interest in machine learning concepts
    {"PM": 0.1, "SWE": 0.2, "ML": 0.5, "Data": 0.2},
    # q6: Leading cross-functional teams
    {"PM": 0.5, "SWE": 0.1, "ML": 0.1, "Data": 0.3},
    # q7: Experience with SQL / relational databases
    {"PM": 0.1, "SWE": 0.2, "ML": 0.2, "Data": 0.5},
    # q8: Building / shipping software features
    {"PM": 0.2, "SWE": 0.5, "ML": 0.2, "Data": 0.1},
    # q9: Communicating with non-technical stakeholders
    {"PM": 0.5, "SWE": 0.1, "ML": 0.2, "Data": 0.2},
    # q10: Interest in statistics and probability
    {"PM": 0.1, "SWE": 0.1, "ML": 0.4, "Data": 0.4},
    # q11: Writing user stories / managing product backlog
    {"PM": 0.5, "SWE": 0.2, "ML": 0.1, "Data": 0.2},
    # q12: Algorithms and data structures comfort
    {"PM": 0.1, "SWE": 0.5, "ML": 0.3, "Data": 0.1},
    # q13: Interest in building predictive models
    {"PM": 0.1, "SWE": 0.1, "ML": 0.5, "Data": 0.3},
    # q14: Using data to influence decisions
    {"PM": 0.3, "SWE": 0.1, "ML": 0.2, "Data": 0.4},
    # q15: Interest in system design and architecture
    {"PM": 0.2, "SWE": 0.5, "ML": 0.2, "Data": 0.1},
]


def calculate_scores(
    answers: Dict[str, int],
    question_weights: List[Dict[str, float]] = QUESTION_WEIGHTS,
) -> Dict[str, int]:
    """
    Calculate normalized per-role scores from user answers.

    Args:
        answers: {"q1": 4, "q2": 2, ...} — answer values 1-5 for each question
        question_weights: list of per-role weight dicts, aligned by index

    Returns:
        {"PM": 72, "SWE": 55, "ML": 43, "Data": 61} — scores 0-100
    """
    scores: Dict[str, float] = {"PM": 0.0, "SWE": 0.0, "ML": 0.0, "Data": 0.0}

    answer_values = list(answers.values())
    for i, answer_value in enumerate(answer_values):
        weights = question_weights[i]
        for role, weight in weights.items():
            scores[role] += answer_value * weight

    # Max possible score = sum of the largest weight per question × max answer (5)
    max_possible = sum(max(w.values()) * 5 for w in question_weights)

    return {
        role: round((score / max_possible) * 100)
        for role, score in scores.items()
    }


def get_recommended_role(scores: Dict[str, int]) -> str:
    """
    Returns the role with the highest score.
    Ties are broken by order: PM → SWE → ML → Data.
    """
    role_order = ["PM", "SWE", "ML", "Data"]
    return max(role_order, key=lambda r: scores.get(r, 0))


def get_confidence_delta(pre: int, post: int) -> int:
    """Returns confidence change (post - pre). Positive = gained confidence."""
    return post - pre
