from apscheduler.schedulers.asyncio import AsyncIOScheduler
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from config import get_settings
from routers import assessments, resources
from routers.sessions import router as sessions_router
from routers.feedback import router as feedback_router
from services.analytics import get_admin_summary

settings = get_settings()

# APScheduler — used for 14-day follow-up emails
scheduler = AsyncIOScheduler()

app = FastAPI(
    title="Career Navigator API",
    version="2.0.0",
    description="CS Career Assessment Platform — no login required",
    docs_url="/api/docs" if settings.environment == "development" else None,
    redoc_url=None,
)

# ─────────────────────────────────────────────
# CORS
# ─────────────────────────────────────────────
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# ─────────────────────────────────────────────
# Lifecycle
# ─────────────────────────────────────────────
@app.on_event("startup")
async def startup():
    scheduler.start()
    print("[SCHEDULER] APScheduler started — follow-up emails will fire on schedule")


@app.on_event("shutdown")
async def shutdown():
    scheduler.shutdown(wait=False)


# ─────────────────────────────────────────────
# Routers
# ─────────────────────────────────────────────
app.include_router(sessions_router)
app.include_router(assessments.router)
app.include_router(resources.router)
app.include_router(feedback_router)


# ─────────────────────────────────────────────
# Admin analytics (internal)
# ─────────────────────────────────────────────
@app.get("/api/admin/analytics", tags=["admin"])
async def admin_analytics():
    return await get_admin_summary()


# ─────────────────────────────────────────────
# Health check
# ─────────────────────────────────────────────
@app.get("/api/health", tags=["health"])
async def health():
    return {"status": "ok", "environment": settings.environment}
