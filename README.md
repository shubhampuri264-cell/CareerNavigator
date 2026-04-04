# CS Career Navigator

**CS Career Navigator** is a personalized career assessment tool built for computer science students who are deciding which path to pursue after graduation. Users enter their name, answer 15 skill-based questions, and receive an AI-powered ranking of the four most common CS career tracks — Product Management, Software Engineering, Machine Learning Engineering, and Data Science — with fit scores, a per-role score breakdown, identified skill gaps, and curated learning resources. No account or password is required. If an email is provided, results are delivered to their inbox immediately with a 14-day follow-up.

---

## Quick Start

**TL;DR** — Get running in 5 minutes:

```bash
# 1. Clone and setup backend
cd backend
python -m venv .venv
source .venv/Scripts/activate  # Windows (macOS/Linux: source .venv/bin/activate)
pip install -r requirements.txt
# Create backend/.env from .env.example and add your Supabase + API keys
uvicorn main:app --reload --port 8000

# 2. In a new terminal, setup frontend
cd frontend
npm install
# Create frontend/.env.local from .env.example and add your environment variables
npm run dev

# 3. Open http://localhost:5173 in your browser
```

**Note:** You'll need to set up Supabase and run the SQL migrations first (see [Getting Started](#getting-started) below).

---

## Features

- **No login required** — enter a name and optional email, then start
- **15-question assessment** — questions calibrated to real CS role skills and behaviors
- **Dual scoring** — deterministic weighted algorithm + Gemini AI top-3 ranked recommendations
- **Skill gap detection** — flags low-scoring key questions for the recommended role
- **Role resources** — curated courses, articles, books, and videos per track
- **Email delivery** — results emailed immediately via Gmail SMTP; follow-up at +14 days via APScheduler
- **Feedback form** — star rating, accuracy check, and free-text response collected post-results

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind CSS + React Router v6 |
| Backend | FastAPI + Pydantic v2 + Uvicorn + APScheduler |
| Database | Supabase (PostgreSQL + RLS) |
| AI | Google Gemini 1.5 Flash (`google-genai`) |
| Email | Python `smtplib` — Gmail SMTP, no third-party package |

---

## Project Structure

```
CareerNavigator/
├── backend/
│   ├── main.py                  # FastAPI app + APScheduler lifecycle
│   ├── config.py                # Pydantic settings (reads from .env)
│   ├── database.py              # Supabase client (anon + service_role)
│   ├── models.py                # Pydantic request/response models
│   ├── routers/
│   │   ├── sessions.py          # POST /api/sessions
│   │   ├── assessments.py       # POST /api/assessments/start & /submit
│   │   ├── resources.py         # GET  /api/resources/{role}
│   │   └── feedback.py          # POST /api/feedback
│   ├── services/
│   │   ├── scoring.py           # Weighted scoring algorithm
│   │   ├── gemini.py            # Gemini AI recommendations
│   │   ├── email.py             # SMTP email (results + follow-up)
│   │   └── analytics.py        # Admin summary queries
│   ├── sql/
│   │   ├── schema.sql           # Original base schema
│   │   ├── seed_data.sql        # Role resources seed data
│   │   └── v2_migration.sql     # Sessions, feedback, assessments migration
│   ├── requirements.txt
│   └── .env                     # Never committed
└── frontend/
    ├── src/
    │   ├── App.jsx               # Routes + SessionProvider
    │   ├── context/
    │   │   └── SessionContext.jsx  # Guest session (name, email, id)
    │   ├── api/
    │   │   ├── sessions.js       # createSession()
    │   │   ├── assessments.js    # startAssessment(), submitAssessment()
    │   │   ├── feedback.js       # submitFeedback()
    │   │   └── resources.js      # getResources()
    │   ├── pages/
    │   │   ├── Landing.jsx       # Entry form (name + email)
    │   │   ├── Assessment.jsx    # 15-question flow with progress bar
    │   │   ├── Results.jsx       # AI cards, scores, skill gaps, resources, feedback
    │   │   └── Resources.jsx     # Full resource list by role
    │   └── data/
    │       └── questions.js      # 15 question definitions
    ├── package.json
    └── .env.local                # Never committed
```

---

## Getting Started

### Prerequisites
- **Python 3.11+** — Backend API and services
- **Node.js 18+** — Frontend development and build
- **[Supabase](https://supabase.com)** project — Free tier works perfectly
- **Google account with 2FA** — For Gmail SMTP email delivery (optional)
- **[Google AI Studio](https://aistudio.google.com) API key** — For Gemini AI recommendations

### 1. Supabase Setup

Open your Supabase project → **SQL Editor** and run these files in order:

```
backend/sql/schema.sql       ← base tables
backend/sql/seed_data.sql    ← populates role_resources
backend/sql/v2_migration.sql ← sessions, feedback, assessments v2
```

### 2. Backend

```bash
cd backend

python -m venv .venv
source .venv/Scripts/activate      # Windows
# source .venv/bin/activate         # macOS / Linux

pip install -r requirements.txt

# Edit .env with your credentials (see section below)
uvicorn main:app --reload --port 8000
```

API available at `http://localhost:8000`
Swagger docs at `http://localhost:8000/api/docs`

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

App available at `http://localhost:5173`

---

## Environment Variables

### `backend/.env`

```env
# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# CORS
CORS_ORIGINS=["http://localhost:5173"]

# Email — Gmail SMTP (no third-party package needed)
# Get App Password: myaccount.google.com/apppasswords (requires 2FA)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=you@gmail.com
SMTP_PASSWORD=xxxx xxxx xxxx xxxx
EMAIL_FROM=you@gmail.com

# Gemini AI — get key at aistudio.google.com
GEMINI_API_KEY=your-gemini-key

ENVIRONMENT=development
```

### `frontend/.env.local`

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_BASE_URL=http://localhost:8000
```

---

## How Scoring Works

Each of the 15 questions has a set of per-role weights (PM, SWE, ML, Data). The user's answer (1–5 scale) is multiplied by the weight for each role and accumulated. Final scores are normalized to 0–100. The role with the highest score is the algorithmic recommendation.

On top of that, the 15 answers are sent to **Gemini 1.5 Flash**, which performs a holistic qualitative analysis and returns a top-3 ranked list with personalized fit scores and explanations for each role.

If Gemini is unavailable or returns an invalid response, the assessment still completes with the algorithmic scores intact.

---

## Email Flow

| Trigger | Email sent |
|---|---|
| Assessment submitted (email provided at entry) | Results email — role + score breakdown |
| Feedback submitted with "Email me my results" checked | Results email — same content |
| +14 days after results email | Follow-up check-in via APScheduler |

When `SMTP_USER` / `SMTP_PASSWORD` / `EMAIL_FROM` are not set, all email calls print to the backend console as `[EMAIL STUB]` and the app continues normally.

---

## Testing

### Backend Tests

```bash
cd backend
source .venv/Scripts/activate  # Windows
# source .venv/bin/activate     # macOS / Linux

pytest tests/ -v
```

The test suite includes:
- Scoring algorithm validation
- API endpoint tests (via `conftest.py`)
- Assessment flow testing

### Manual Testing

1. **Health Check**: `GET http://localhost:8000/api/health`
2. **API Documentation**: Open `http://localhost:8000/api/docs` in browser (development mode only)
3. **Complete Flow**:
   - Start frontend and backend
   - Enter name + email on landing page
   - Complete 15-question assessment
   - View results with AI recommendations
   - Submit feedback

---

## Deployment

### Frontend (Vercel)
1. Connect your GitHub repository to Vercel
2. Vercel auto-detects Vite configuration
3. Add environment variables in Vercel dashboard:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_API_BASE_URL` (your backend URL)
4. Deploy from `main` branch

### Backend (Render / Railway / Heroku)

**Render Setup:**
- **Environment**: Python 3
- **Build Command**: `pip install -r requirements.txt`
- **Start Command**: `uvicorn main:app --host 0.0.0.0 --port 10000`
- **Environment Variables**: Add all variables from `backend/.env`
- **Health Check Path**: `/api/health`

**Alternative Platforms:**
- **Railway**: Similar setup, auto-detects Python + requirements.txt
- **Heroku**: Add `Procfile` with `web: uvicorn main:app --host 0.0.0.0 --port $PORT`

---

## Project Status & Features Checklist

- [x] Guest user sessions (no password required)
- [x] 15-question CS career assessment
- [x] Dual scoring system (algorithm + AI)
- [x] Gemini AI integration for personalized recommendations
- [x] Role-specific skill gap detection
- [x] Curated learning resources per career track
- [x] Email delivery of results (Gmail SMTP)
- [x] 14-day follow-up emails via APScheduler
- [x] Feedback collection system
- [x] Admin analytics endpoint
- [x] Supabase database with RLS
- [x] React frontend with Tailwind CSS
- [x] FastAPI backend with Pydantic validation
- [x] Unit tests for scoring logic
- [ ] Integration tests for API endpoints
- [ ] End-to-end testing with Playwright/Cypress
- [ ] User dashboard for viewing past assessments
- [ ] Export results as PDF

---

## Troubleshooting

### Backend Issues

**Import Errors:**
```bash
# Make sure virtual environment is activated
cd backend
source .venv/Scripts/activate  # Windows
pip install -r requirements.txt
```

**Database Connection Errors:**
- Verify `SUPABASE_URL` and keys in `backend/.env`
- Check if Supabase project is active
- Ensure SQL migrations ran successfully

**Email Not Sending:**
- Confirm Gmail 2FA is enabled
- Use App Password, not regular password
- Check `SMTP_*` environment variables
- If testing locally, emails will print to console as `[EMAIL STUB]`

### Frontend Issues

**API Connection Failed:**
- Verify backend is running on correct port
- Check `VITE_API_BASE_URL` in `frontend/.env.local`
- Ensure CORS origins include frontend URL

**Build Failures:**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Common Errors

**"Module not found" in Python:**
- Activate virtual environment before running
- Reinstall dependencies: `pip install -r requirements.txt`

**"Cannot find module" in React:**
- Clear node_modules: `rm -rf node_modules && npm install`
- Check import paths are correct

**Gemini API Rate Limits:**
- Free tier: 15 requests per minute
- Assessment uses 1 request per submission
- Algorithm scoring still works if Gemini fails

---

## Contributing

Contributions are welcome! Please follow these guidelines:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
