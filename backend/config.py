from functools import lru_cache
from typing import List
from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    supabase_url: str
    supabase_anon_key: str
    supabase_service_role_key: str

    secret_key: str = "STUB_NOT_SET"

    cors_origins: List[str] = [
        "http://localhost:5173",
        "https://career-navigator-one.vercel.app",
    ]

    # Email — SMTP (works with Gmail, Outlook, or any SMTP provider)
    # Gmail setup: enable 2FA → myaccount.google.com/apppasswords → create App Password
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = "STUB_NOT_SET"      # your Gmail address
    smtp_password: str = "STUB_NOT_SET"  # Gmail App Password (16 chars, no spaces)
    email_from: str = "STUB_NOT_SET"     # shown as sender — usually same as smtp_user

    # Gemini AI
    gemini_api_key: str = "STUB_NOT_SET"

    environment: str = "production"

    class Config:
        env_file = ".env"
        env_file_encoding = "utf-8"
        # pydantic-settings silently ignores a missing .env file,
        # so Vercel (which injects env vars at OS level) works without one.


@lru_cache()
def get_settings() -> Settings:
    return Settings()
