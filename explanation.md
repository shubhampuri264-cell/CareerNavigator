# CareerNavigator — Project Explanation

## What Is This Project?

CareerNavigator is a CS career assessment tool built for computer science students who are unsure which career path suits them best. A user enters their name (and optionally their email), answers 15 questions on a 1–5 scale, and receives a personalized recommendation across four career tracks:

- **PM** — Product Manager
- **SWE** — Software Engineer
- **ML** — Machine Learning Engineer
- **Data** — Data Scientist / Analyst

No account or login is required. The whole flow takes about 5 minutes.

---

## How It Works — User Journey

1. **Landing page** — User enters name + optional email, clicks "Start Assessment"
2. **Assessment** — 15 questions, one at a time, rated 1–5
3. **Results** — User sees:
   - AI-ranked top 3 career matches (powered by Google Gemini)
   - Score breakdown across all 4 roles (0–100, from the scoring algorithm)
   - Skill gaps — areas that scored low for their top role
   - Curated learning resources for their recommended role
4. **Feedback** — User can rate accuracy (1–5 stars) and optionally receive results by email
5. **Email** — If email was provided, results are sent immediately + a 14-day follow-up check-in is scheduled

---

## Technology Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS |
| Routing | React Router v6 |
| HTTP Client | Axios |
| Backend | FastAPI (Python) |
| Database | Supabase (PostgreSQL) |
| AI | Google Gemini 1.5 Flash |
| Email | Python smtplib (Gmail SMTP) |
| Scheduling | APScheduler (14-day follow-ups) |
| Deployment | Vercel (frontend + backend) |

---

## Project Structure

```
CareerNavigator/
├── backend/
│   ├── main.py                  # FastAPI app entry point
│   ├── config.py                # Environment variable settings
│   ├── database.py              # Supabase client setup
│   ├── models.py                # Pydantic request/response models
│   ├── routers/
│   │   ├── sessions.py          # POST /api/sessions
│   │   ├── assessments.py       # POST /api/assessments/start & /submit
│   │   ├── resources.py         # GET /api/resources/{role}
│   │   └── feedback.py          # POST /api/feedback
│   ├── services/
│   │   ├── scoring.py           # Weighted scoring algorithm
│   │   ├── gemini.py            # Google Gemini AI integration
│   │   ├── email.py             # SMTP email sender
│   │   └── analytics.py        # Admin analytics queries
│   └── sql/
│       ├── schema.sql           # Base database tables
│       ├── seed_data.sql        # Learning resources data
│       └── v2_migration.sql     # Sessions + feedback tables
│
└── frontend/
    └── src/
        ├── pages/
        │   ├── Landing.jsx      # Entry form + role showcase
        │   ├── Assessment.jsx   # 15-question flow
        │   ├── Results.jsx      # Scores + AI recs + feedback
        │   └── Resources.jsx    # Full resource list per role
        ├── components/
        │   ├── ScoreCard.jsx    # Per-role score bar
        │   ├── ProgressBar.jsx  # Question progress indicator
        │   └── ErrorBanner.jsx  # Error display
        ├── context/
        │   └── SessionContext.jsx  # Guest session state
        ├── api/
        │   ├── sessions.js      # createSession()
        │   ├── assessments.js   # startAssessment(), submitAssessment()
        │   ├── feedback.js      # submitFeedback()
        │   └── axiosInstance.js # Configured axios client
        └── data/
            └── questions.js     # 15 question definitions
```

---

## Key Code: The Scoring Algorithm

**File:** `backend/services/scoring.py`

Each of the 15 questions has a different weight for each of the 4 roles. A user's answer (1–5) is multiplied by the weight and accumulated. The final score is normalized to 0–100.

```python
QUESTION_WEIGHTS = [
    # q1: Preferred problem-solving approach
    {"PM": 0.4, "SWE": 0.2, "ML": 0.2, "Data": 0.2},
    # q2: Most energizing activity
    {"PM": 0.5, "SWE": 0.1, "ML": 0.2, "Data": 0.2},
    # q3: Comfort writing code from scratch
    {"PM": 0.1, "SWE": 0.5, "ML": 0.3, "Data": 0.1},
    # ... 12 more questions
]

def calculate_scores(answers):
    scores = {"PM": 0.0, "SWE": 0.0, "ML": 0.0, "Data": 0.0}
    for i, answer_value in enumerate(answers.values()):
        for role, weight in QUESTION_WEIGHTS[i].items():
            scores[role] += answer_value * weight

    max_possible = sum(max(w.values()) * 5 for w in QUESTION_WEIGHTS)
    return {role: round((score / max_possible) * 100) for role, score in scores.items()}
```

**In plain English:** If you score high on "running roadmap meetings" (q2), the PM role accumulates 0.5 × your answer. If you score high on "writing code from scratch" (q3), SWE gets 0.5 × your answer. After all 15 questions, the totals are scaled to 0–100. The highest score wins.

---

## Key Code: AI Recommendations (Gemini)

**File:** `backend/services/gemini.py`

After the scoring algorithm runs, the backend also sends all 15 answers to Google Gemini 1.5 Flash and asks it to rank the top 3 career fits with explanations.

```python
async def get_ai_recommendations(answers):
    prompt = _build_prompt(answers)  # Constructs detailed prompt with all Q&A
    raw = await asyncio.to_thread(_call_gemini_sync, prompt)
    return _parse_recommendations(raw)  # Validates and cleans the JSON response
```

The prompt includes:
- All 15 questions and the user's answers
- Role descriptions for PM, SWE, ML, and Data
- Instructions to return JSON with rank, fit_score (0–100), and a 2–3 sentence reason

If Gemini fails for any reason (network error, bad JSON, no API key), the function returns an empty list and the assessment still completes using only the algorithmic scores. This is intentional fault tolerance.

---

## Key Code: Assessment Submission

**File:** `backend/routers/assessments.py`

```python
@router.post("/submit")
async def submit_assessment(body: AssessmentSubmitRequest):
    scores = calculate_scores(body.answers)           # 1. Run scoring algorithm
    recommended = get_recommended_role(scores)         # 2. Pick highest score
    ai_recs = await get_ai_recommendations(body.answers)  # 3. Ask Gemini (async)

    # 4. Save everything to database
    supabase_admin.table("assessments").update({
        "answers": body.answers,
        "scores": scores,
        "recommended_role": recommended,
        "ai_recommendations": ai_recs,
        "status": "completed",
    }).eq("id", body.assessment_id).execute()

    # 5. Fire-and-forget email if session has an email
    asyncio.create_task(_maybe_send_email(session_id, recommended, scores, ...))
```

---

## Key Code: The 15 Questions

**File:** `frontend/src/data/questions.js`

Each question has an ID, text, and scale anchor labels. The order here must match the weights in `scoring.py` exactly — they are indexed by position.

```javascript
export const QUESTIONS = [
  {
    id: 'q1',
    text: 'When you encounter a complex problem, you prefer to:',
    scaleLabels: { 1: 'Dig into code / technical details', 5: 'Map stakeholders and define requirements' },
  },
  {
    id: 'q3',
    text: 'Rate your comfort writing code from scratch to solve a problem.',
    scaleLabels: { 1: 'Not comfortable at all', 5: 'Very comfortable — I do it daily' },
  },
  // ... 13 more questions
]
```

---

## Key Code: Results Page

**File:** `frontend/src/pages/Results.jsx`

The Results page fetches the completed assessment and displays three sections:

1. **AI Recommendation Cards** — if Gemini returned results, shows top 3 ranked cards with fit scores and personalized explanations
2. **Score Breakdown** — bar chart of all 4 role scores from the algorithm
3. **Skill Gaps** — questions where the user scored ≤ 2 for their top recommended role, flagged as areas to develop

```javascript
// Skill gaps: key questions for topRole where user scored ≤ 2
const gaps = (SKILL_GAPS[topRole] || []).filter(({ qId }) => (answers[qId] ?? 5) <= 2)
```

---

## Key Code: Guest Session (No Login Required)

**File:** `frontend/src/context/SessionContext.jsx`

The app works without any login. When a user submits their name on the landing page, a guest session is created in the database and stored in `localStorage`. This session ID links all their data together.

```javascript
// Stored in localStorage under key "cn_session"
{ id: "uuid", name: "Alice", email: "alice@example.com", created_at: "..." }
```

On the backend, `POST /api/sessions` creates a row in the `sessions` table and returns the session object. Everything downstream (assessment, feedback, email) references this session ID.

---

## Database Tables

| Table | Purpose |
|---|---|
| `sessions` | Guest session (name, optional email) |
| `assessments` | Answers, scores, AI recs, recommended role |
| `feedback` | Star rating, accuracy, free text, email request |
| `role_resources` | Curated learning resources per role |

---

## Where AI Was Used in Development

### 1. Designing the Question Weights
The 15 questions and their per-role weights (`QUESTION_WEIGHTS` in `scoring.py`) were designed with AI assistance. I used Claude to brainstorm which questions would best differentiate between PM, SWE, ML, and Data roles, and how to weight them so the algorithm produces meaningful scores.

### 2. Writing the Gemini Prompt
The prompt inside `gemini.py` (`_build_prompt()`) was iteratively refined with AI help. Getting Gemini to return clean, structured JSON with specific fit scores and 2–3 sentence explanations required several rounds of prompt engineering — the temperature setting (0.3), the role descriptions, and the explicit JSON schema were all tuned with AI feedback.

### 3. Email HTML Templates
The styled HTML email templates in `email.py` were generated with AI assistance. Writing good-looking HTML emails is notoriously tedious — AI helped produce the gradient header, score breakdown table, and responsive layout quickly.

### 4. Scoring Algorithm Normalization
The normalization formula (`max_possible = sum(max(w.values()) * 5 for w in QUESTION_WEIGHTS)`) was suggested by AI during a discussion about how to fairly compare scores across roles that have different total weights.

### 5. FastAPI Boilerplate & Pydantic Models
The initial structure of routers, Pydantic models (`models.py`), and the APScheduler lifecycle hooks (`main.py`) were scaffolded with AI assistance. I reviewed and adapted these to fit the specific requirements.

---

## What I Built / Decided Myself

- The overall product concept — a career assessment tool specifically for CS students
- The choice of 4 career tracks (PM, SWE, ML, Data)
- The decision to make it login-free (guest sessions via localStorage)
- The dual-scoring approach: deterministic algorithm + AI recommendations as a cross-check
- The 14-day email follow-up feature
- Vercel multi-service deployment configuration (`vercel.json`)
- The skill gaps feature — showing users which specific competencies need work
- All UI/UX decisions (layout, color coding by role, card designs)

---

## How to Run Locally

**Backend:**
```bash
cd backend
python -m venv .venv && source .venv/bin/activate  # or .venv\Scripts\activate on Windows
pip install -r requirements.txt
# Create .env from .env.example and fill in Supabase + Gemini keys
uvicorn main:app --reload
```

**Frontend:**
```bash
cd frontend
npm install
# Create .env.local from .env.example and set VITE_API_BASE_URL=http://localhost:8000
npm run dev
```

---

## API Endpoints Summary

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/sessions` | Create guest session |
| POST | `/api/assessments/start` | Begin a new assessment |
| POST | `/api/assessments/submit` | Submit answers, get scores + AI recs |
| GET | `/api/assessments/{id}` | Fetch completed assessment |
| GET | `/api/resources/{role}` | Get learning resources for a role |
| POST | `/api/feedback` | Submit user feedback |
| GET | `/api/health` | Health check |
| GET | `/api/admin/analytics` | Usage summary |
