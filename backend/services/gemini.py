"""
Gemini AI Service — Career Role Recommendations

Sends the user's 15 assessment answers to Gemini and receives a ranked
top-3 list of career roles with fit scores and personalized explanations.

The function is intentionally fault-tolerant: any failure (network,
quota, bad JSON, etc.) returns an empty list so the assessment still
completes with algorithmic scores intact.
"""

import asyncio
import json
from typing import List, Dict

from google import genai
from google.genai import types

from config import get_settings

settings = get_settings()

# ─── Role metadata sent to Gemini as context ──────────────────────────────────
ROLE_INFO: Dict[str, Dict[str, str]] = {
    "PM": {
        "title": "Product Manager",
        "description": (
            "Drives product vision, roadmaps, and go-to-market strategy. "
            "Works at the intersection of business, technology, and user experience. "
            "Leads cross-functional teams without direct authority, prioritizes ruthlessly, "
            "and translates user needs into product decisions."
        ),
    },
    "SWE": {
        "title": "Software Engineer",
        "description": (
            "Builds scalable systems, writes production-grade code, solves algorithmic problems, "
            "and designs APIs and system architectures. The technical backbone of product delivery. "
            "Strong in data structures, debugging, and shipping reliable software."
        ),
    },
    "ML": {
        "title": "Machine Learning Engineer",
        "description": (
            "Designs, trains, and deploys machine learning models. Works with neural networks, "
            "optimization algorithms, and large datasets. Combines deep mathematical foundations "
            "(probability, linear algebra, statistics) with practical engineering to build AI systems."
        ),
    },
    "Data": {
        "title": "Data Scientist / Analyst",
        "description": (
            "Extracts actionable insights from data through analysis, visualization, and modeling. "
            "Writes complex SQL queries, builds dashboards, runs A/B tests, and communicates "
            "quantitative findings to non-technical stakeholders to drive business decisions."
        ),
    },
}

# ─── Question text (must match frontend/src/data/questions.js by index) ───────
QUESTIONS_TEXT: List[str] = [
    "When you encounter a complex problem, how much do you prefer to map stakeholder needs over diving into technical details?",
    "How much does running strategy or roadmap meetings energize you over building and shipping features?",
    "How comfortable are you writing code from scratch to solve a problem?",
    "How often do you work with large datasets, spreadsheets, or databases?",
    "How genuinely interested are you in machine learning concepts (neural nets, embeddings, gradient descent)?",
    "How comfortable are you leading meetings, driving decisions, and aligning people across teams?",
    "How experienced are you with writing SQL queries or working with relational databases?",
    "How often do you build, prototype, or ship software features?",
    "How comfortable are you translating technical results into plain language for non-technical stakeholders?",
    "How strong is your interest in statistics, probability, and quantitative reasoning?",
    "How often do you write user stories, define acceptance criteria, or manage a product backlog?",
    "How comfortable are you with algorithms, data structures, and Big-O complexity analysis?",
    "How interested are you in building predictive models that learn from historical data?",
    "How often do you use data analysis or metrics to justify or change a decision?",
    "How strong is your interest in system design: APIs, microservices, and scalable infrastructure?",
]


def _build_prompt(answers: Dict[str, int]) -> str:
    """Construct the Gemini prompt from the user's answers."""
    qa_lines = []
    for i, (q_id, value) in enumerate(answers.items()):
        if i < len(QUESTIONS_TEXT):
            qa_lines.append(f"  Q{i + 1} ({q_id}): {QUESTIONS_TEXT[i]}\n    → Answer: {value}/5")

    role_context = "\n".join(
        f"  • {role} — {info['title']}: {info['description']}"
        for role, info in ROLE_INFO.items()
    )

    qa_block = "\n".join(qa_lines)

    return f"""You are an expert CS career advisor. A student has completed a 15-question self-assessment on a 1–5 scale where:
  1 = strongly disagree / never / not at all comfortable
  5 = strongly agree / always / very comfortable

Available career tracks:
{role_context}

Student's answers:
{qa_block}

Analyze these answers holistically. Consider:
- Which skills and behaviors the student scores highest on
- Which role naturally demands those skills
- Whether there are secondary strengths that point to a second or third role
- The nuance between ML and Data (ML requires deeper math/ML knowledge; Data focuses on SQL, BI, communication)

Return ONLY valid JSON with exactly this structure (no markdown, no extra text):
{{
  "recommendations": [
    {{
      "rank": 1,
      "role": "SWE",
      "title": "Software Engineer",
      "fit_score": 88,
      "reason": "2–3 sentence explanation referencing specific answers that support this recommendation."
    }},
    {{
      "rank": 2,
      "role": "ML",
      "title": "Machine Learning Engineer",
      "fit_score": 71,
      "reason": "2–3 sentence explanation."
    }},
    {{
      "rank": 3,
      "role": "Data",
      "title": "Data Scientist / Analyst",
      "fit_score": 58,
      "reason": "2–3 sentence explanation."
    }}
  ]
}}

Rules:
- role must be exactly one of: PM, SWE, ML, Data
- Each role appears at most once
- Exactly 3 recommendations
- fit_score is an integer 0–100 representing percentage match
- reason must be 2–3 sentences, specific to the student's answers
- No ties: each fit_score must be unique
- Rank 1 has the highest fit_score"""


def _call_gemini_sync(prompt: str) -> str:
    """Synchronous Gemini call, run in a thread to avoid blocking the event loop."""
    client = genai.Client(api_key=settings.gemini_api_key)
    response = client.models.generate_content(
        model="gemini-1.5-flash",
        contents=prompt,
        config=types.GenerateContentConfig(
            temperature=0.3,
            max_output_tokens=1024,
        ),
    )
    return response.text


def _parse_recommendations(raw: str) -> List[Dict]:
    """Parse and validate Gemini JSON output. Returns empty list on any failure."""
    text = raw.strip()

    # Strip markdown code fences if Gemini wrapped output anyway
    if text.startswith("```"):
        parts = text.split("```")
        text = parts[1] if len(parts) > 1 else text
        if text.startswith("json"):
            text = text[4:]
    text = text.strip()

    data = json.loads(text)  # raises ValueError if not valid JSON
    raw_recs = data.get("recommendations", [])

    valid_roles = set(ROLE_INFO.keys())
    seen_roles: set = set()
    clean: List[Dict] = []

    for rec in raw_recs[:3]:
        role = rec.get("role", "")
        fit_score = rec.get("fit_score", 0)
        reason = rec.get("reason", "")

        if (
            role not in valid_roles
            or role in seen_roles
            or not isinstance(fit_score, (int, float))
            or not isinstance(reason, str)
            or not reason.strip()
        ):
            continue

        clean.append({
            "rank": len(clean) + 1,
            "role": role,
            "title": ROLE_INFO[role]["title"],
            "fit_score": min(100, max(0, int(fit_score))),
            "reason": reason.strip()[:600],
        })
        seen_roles.add(role)

    return clean


async def get_ai_recommendations(answers: Dict[str, int]) -> List[Dict]:
    """
    Get top-3 AI career recommendations from Gemini.

    Returns:
        List of 3 dicts: [{rank, role, title, fit_score, reason}, ...]
        Empty list if the API key is not set or any error occurs.
    """
    if not settings.gemini_api_key or settings.gemini_api_key == "STUB_NOT_SET":
        print("[GEMINI] API key not configured — skipping AI recommendations")
        return []

    try:
        prompt = _build_prompt(answers)
        # Run the blocking Gemini SDK call in a thread pool
        raw = await asyncio.to_thread(_call_gemini_sync, prompt)
        recs = _parse_recommendations(raw)

        if len(recs) < 3:
            print(f"[GEMINI] Only {len(recs)} valid recommendations returned — using what we have")

        return recs

    except json.JSONDecodeError as e:
        print(f"[GEMINI] JSON parse error: {e}")
        return []
    except Exception as e:
        print(f"[GEMINI] Unexpected error: {e}")
        return []
