"""
Unit tests for the scoring engine.
Run with: pytest tests/ -v
"""

import pytest
from services.scoring import (
    QUESTION_WEIGHTS,
    calculate_scores,
    get_recommended_role,
    get_confidence_delta,
)


def _make_answers(value: int = 3) -> dict:
    """Create a uniform answers dict with all 15 questions set to `value`."""
    return {f"q{i+1}": value for i in range(15)}


class TestQuestionWeights:
    def test_has_fifteen_questions(self):
        assert len(QUESTION_WEIGHTS) == 15

    def test_all_four_roles_present(self):
        for i, weights in enumerate(QUESTION_WEIGHTS):
            assert set(weights.keys()) == {"PM", "SWE", "ML", "Data"}, (
                f"Question {i+1} missing a role key"
            )

    def test_all_weights_positive(self):
        for i, weights in enumerate(QUESTION_WEIGHTS):
            for role, w in weights.items():
                assert w >= 0, f"Negative weight for {role} in question {i+1}"


class TestCalculateScores:
    def test_returns_all_four_roles(self):
        scores = calculate_scores(_make_answers())
        assert set(scores.keys()) == {"PM", "SWE", "ML", "Data"}

    def test_scores_in_valid_range(self):
        scores = calculate_scores(_make_answers())
        for role, score in scores.items():
            assert 0 <= score <= 100, f"{role} score {score} out of range"

    def test_uniform_answers_returns_integers(self):
        scores = calculate_scores(_make_answers(3))
        for score in scores.values():
            assert isinstance(score, int)

    def test_max_answers_produces_nonzero_scores(self):
        scores = calculate_scores(_make_answers(5))
        assert all(s > 0 for s in scores.values())

    def test_min_answers_produces_lower_scores(self):
        low = calculate_scores(_make_answers(1))
        high = calculate_scores(_make_answers(5))
        for role in ["PM", "SWE", "ML", "Data"]:
            assert low[role] <= high[role]

    def test_swe_biased_answers_recommends_swe(self):
        """
        Answer 5 on all SWE-heavy questions (q3, q8, q12, q15) and
        1 on all PM-heavy questions — expect SWE to score highest.
        """
        # SWE-heavy question indices (0-based): 2, 7, 11, 14
        swe_heavy = {2, 7, 11, 14}
        pm_heavy = {0, 1, 5, 8, 10}

        answers = {}
        for i in range(15):
            q_id = f"q{i+1}"
            if i in swe_heavy:
                answers[q_id] = 5
            elif i in pm_heavy:
                answers[q_id] = 1
            else:
                answers[q_id] = 3

        scores = calculate_scores(answers)
        assert get_recommended_role(scores) == "SWE", (
            f"Expected SWE recommendation, got scores: {scores}"
        )

    def test_pm_biased_answers_recommends_pm(self):
        """Answer 5 on all PM-heavy questions — expect PM to score highest."""
        pm_heavy = {0, 1, 5, 8, 10}
        swe_heavy = {2, 7, 11, 14}

        answers = {}
        for i in range(15):
            q_id = f"q{i+1}"
            if i in pm_heavy:
                answers[q_id] = 5
            elif i in swe_heavy:
                answers[q_id] = 1
            else:
                answers[q_id] = 2

        scores = calculate_scores(answers)
        assert get_recommended_role(scores) == "PM", (
            f"Expected PM recommendation, got scores: {scores}"
        )

    def test_data_biased_answers_recommends_data(self):
        """Answer 5 on all Data-heavy questions — expect Data to score highest."""
        data_heavy = {3, 6, 9, 13}
        ml_heavy = {4, 9, 12}

        answers = {}
        for i in range(15):
            q_id = f"q{i+1}"
            if i in data_heavy:
                answers[q_id] = 5
            elif i == 4 or i == 12:  # ML-only heavy, keep low
                answers[q_id] = 1
            else:
                answers[q_id] = 2

        scores = calculate_scores(answers)
        assert get_recommended_role(scores) == "Data", (
            f"Expected Data recommendation, got scores: {scores}"
        )


class TestGetRecommendedRole:
    def test_returns_highest_scoring_role(self):
        scores = {"PM": 70, "SWE": 55, "ML": 43, "Data": 61}
        assert get_recommended_role(scores) == "PM"

    def test_tie_broken_by_order(self):
        # PM comes before SWE in the order list
        scores = {"PM": 60, "SWE": 60, "ML": 40, "Data": 40}
        assert get_recommended_role(scores) == "PM"

    def test_single_dominant_role(self):
        scores = {"PM": 10, "SWE": 10, "ML": 90, "Data": 10}
        assert get_recommended_role(scores) == "ML"


class TestGetConfidenceDelta:
    def test_positive_delta(self):
        assert get_confidence_delta(5, 8) == 3

    def test_negative_delta(self):
        assert get_confidence_delta(8, 5) == -3

    def test_zero_delta(self):
        assert get_confidence_delta(7, 7) == 0
