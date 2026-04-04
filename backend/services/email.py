"""
Email Service — SMTP (no third-party package required)

Uses Python's built-in smtplib. Works with Gmail, Outlook, or any SMTP server.

To activate with Gmail:
  1. Enable 2-Factor Authentication on your Google Account
  2. Go to  myaccount.google.com/apppasswords
  3. Create an App Password (select "Mail" / "Other")
  4. Add to backend/.env:
       SMTP_USER=you@gmail.com
       SMTP_PASSWORD=xxxxxxxxxxxx    ← 16-char App Password (no spaces)
       EMAIL_FROM=you@gmail.com
       SMTP_HOST=smtp.gmail.com      ← default, can omit
       SMTP_PORT=587                 ← default, can omit

For Outlook/Hotmail:
  SMTP_HOST=smtp-mail.outlook.com
  SMTP_PORT=587
"""

import asyncio
import smtplib
from datetime import datetime, timezone, timedelta
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

from config import get_settings

settings = get_settings()

ROLE_LABELS = {
    "PM":   "Product Manager",
    "SWE":  "Software Engineer",
    "ML":   "Machine Learning Engineer",
    "Data": "Data Scientist / Analyst",
}

_SMTP_ACTIVE = (
    settings.smtp_user != "STUB_NOT_SET"
    and settings.smtp_password != "STUB_NOT_SET"
    and settings.email_from != "STUB_NOT_SET"
)


# ─── Email templates ──────────────────────────────────────────────────────────

def _build_results_html(name: str, recommended_role: str, scores: dict, assessment_id: str) -> str:
    role_label = ROLE_LABELS.get(recommended_role, recommended_role)

    score_rows = "".join(
        f"<tr>"
        f"<td style='padding:8px 16px;font-weight:600;border-bottom:1px solid #f3f4f6;'>"
        f"{ROLE_LABELS.get(r, r)}</td>"
        f"<td style='padding:8px 16px;border-bottom:1px solid #f3f4f6;'>{s}/100</td>"
        f"</tr>"
        for r, s in sorted(scores.items(), key=lambda x: -x[1])
    )

    return f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#4f46e5,#3b82f6);padding:32px;
                  border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">Your CS Career Results</h1>
        <p style="color:#c7d2fe;margin:8px 0 0;">Career Navigator Assessment</p>
      </div>
      <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;
                  border:1px solid #e5e7eb;">
        <p style="margin:0 0 20px;">Hi <strong>{name}</strong>,</p>
        <p style="margin:0 0 24px;color:#374151;">
          Here are your personalized results from the CS Career Navigator assessment.
        </p>

        <div style="background:white;border:2px solid #4f46e5;border-radius:10px;
                    padding:20px;text-align:center;margin-bottom:24px;">
          <p style="margin:0 0 4px;font-size:12px;font-weight:700;text-transform:uppercase;
                    color:#6b7280;letter-spacing:.05em;">Top Recommended Role</p>
          <h2 style="margin:0;font-size:28px;color:#4f46e5;">{role_label}</h2>
        </div>

        <h3 style="font-size:13px;font-weight:700;text-transform:uppercase;color:#6b7280;
                   letter-spacing:.05em;margin:0 0 12px;">Score Breakdown</h3>
        <table style="width:100%;border-collapse:collapse;background:white;border-radius:8px;
                      overflow:hidden;border:1px solid #e5e7eb;margin-bottom:24px;">
          {score_rows}
        </table>

        <p style="font-size:12px;color:#9ca3af;text-align:center;margin:0;">
          You'll receive a follow-up check-in in 14 days.<br>
          Assessment ID: {assessment_id}
        </p>
      </div>
    </div>
    """


def _build_followup_html(name: str, assessment_id: str) -> str:
    return f"""
    <div style="font-family:Inter,Arial,sans-serif;max-width:560px;margin:0 auto;color:#1f2937;">
      <div style="background:linear-gradient(135deg,#4f46e5,#3b82f6);padding:32px;
                  border-radius:12px 12px 0 0;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">14-Day Check-In</h1>
        <p style="color:#c7d2fe;margin:8px 0 0;">Career Navigator</p>
      </div>
      <div style="background:#f9fafb;padding:32px;border-radius:0 0 12px 12px;
                  border:1px solid #e5e7eb;">
        <p>Hi <strong>{name}</strong>,</p>
        <p>It's been two weeks since you completed your CS career assessment. How's your clarity?</p>
        <p>If things have shifted, take the assessment again — your profile evolves as your skills grow.</p>
        <p style="font-size:12px;color:#9ca3af;margin-top:24px;">
          Assessment ID: {assessment_id}
        </p>
      </div>
    </div>
    """


# ─── SMTP send (sync — run in thread pool) ────────────────────────────────────

def _smtp_send(to_email: str, subject: str, html_body: str) -> None:
    """Blocking SMTP send. Always call via asyncio.to_thread in async contexts."""
    msg = MIMEMultipart("alternative")
    msg["Subject"] = subject
    msg["From"]    = settings.email_from
    msg["To"]      = to_email
    msg.attach(MIMEText(html_body, "html", "utf-8"))

    with smtplib.SMTP(settings.smtp_host, settings.smtp_port) as server:
        server.ehlo()
        server.starttls()
        server.login(settings.smtp_user, settings.smtp_password)
        server.send_message(msg)


# ─── Public API ───────────────────────────────────────────────────────────────

async def send_results_email(
    to_email: str,
    name: str,
    recommended_role: str,
    scores: dict,
    assessment_id: str,
) -> bool:
    """Send the assessment results summary email."""
    subject   = f"Your CS Career Results — {ROLE_LABELS.get(recommended_role, recommended_role)}"
    html_body = _build_results_html(name, recommended_role, scores, assessment_id)

    if not _SMTP_ACTIVE:
        print(
            f"[EMAIL STUB] Results → {to_email} ({name})\n"
            f"  Role: {recommended_role} | Scores: {scores}\n"
            f"  → Add SMTP_USER / SMTP_PASSWORD / EMAIL_FROM to .env to send real emails."
        )
        return True

    try:
        await asyncio.to_thread(_smtp_send, to_email, subject, html_body)
        print(f"[EMAIL] Results sent to {to_email}")
        return True
    except Exception as e:
        print(f"[EMAIL] Failed to send results to {to_email}: {e}")
        return False


def schedule_followup_email(to_email: str, name: str, assessment_id: str) -> None:
    """
    Schedule a 14-day follow-up email via APScheduler.
    Falls back gracefully if the scheduler is not yet running.
    """
    run_at = datetime.now(timezone.utc) + timedelta(days=14)

    try:
        from main import scheduler  # late import — avoids circular dependency

        scheduler.add_job(
            _send_followup_sync,
            trigger="date",
            run_date=run_at,
            args=[to_email, name, assessment_id],
            id=f"followup_{assessment_id}",
            replace_existing=True,
        )
        print(f"[EMAIL] Follow-up scheduled for {to_email} on {run_at.date()}")
    except Exception as e:
        print(f"[EMAIL] Follow-up scheduling failed ({e}) — would fire on {run_at.date()}")


def _send_followup_sync(to_email: str, name: str, assessment_id: str) -> None:
    """Called by APScheduler (sync context — cannot be async)."""
    subject   = "14-Day Check-In — CS Career Navigator"
    html_body = _build_followup_html(name, assessment_id)

    if not _SMTP_ACTIVE:
        print(f"[EMAIL STUB] Follow-up → {to_email} ({name}) | Assessment: {assessment_id}")
        return

    try:
        _smtp_send(to_email, subject, html_body)
        print(f"[EMAIL] Follow-up sent to {to_email}")
    except Exception as e:
        print(f"[EMAIL] Failed to send follow-up to {to_email}: {e}")
