import logging
from datetime import datetime, timedelta
from email.message import EmailMessage

import aiosmtplib

from src.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        # {server_id: {"status": str, "started_at": datetime, "last_sent_at": datetime}}
        self.active_alerts = {}
        self.repeat_interval = timedelta(minutes=max(settings.email_alert_repeat_minutes, 1))

    async def send_alert(
        self,
        server_id: int,
        server_name: str,
        server_url: str,
        status: str,
        response_ms: int | None,
    ):
        recipients = self._get_recipients()
        if not settings.smtp_user or not recipients:
            return

        now = datetime.utcnow()
        alert_state = self.active_alerts.get(server_id)

        if not alert_state or alert_state["status"] != status:
            started_at = now
            last_sent_at = None
            alert_kind = "initial"
        else:
            started_at = alert_state["started_at"]
            last_sent_at = alert_state["last_sent_at"]
            alert_kind = "reminder"

        if last_sent_at and now - last_sent_at < self.repeat_interval:
            return

        duration = now - started_at
        subject = self._build_subject(server_name, status, duration, alert_kind)
        body = self._build_body(
            name=server_name,
            url=server_url,
            status=status,
            response_ms=response_ms,
            started_at=started_at,
            current_time=now,
            duration=duration,
            alert_kind=alert_kind,
        )

        if await self._send_email(subject, body, recipients):
            self.active_alerts[server_id] = {
                "status": status,
                "started_at": started_at,
                "last_sent_at": now,
            }

    def clear_alert(self, server_id: int):
        self.active_alerts.pop(server_id, None)

    def _build_subject(self, name: str, status: str, duration: timedelta, alert_kind: str) -> str:
        if alert_kind == "initial":
            return f"[ALERT] {name} is {status.upper()}"
        return f"[REMINDER] {name} still {status.upper()} for {self._format_duration(duration)}"

    def _build_body(
        self,
        name: str,
        url: str,
        status: str,
        response_ms: int | None,
        started_at: datetime,
        current_time: datetime,
        duration: timedelta,
        alert_kind: str,
    ) -> str:
        response_info = f"Observed response time: {response_ms}ms" if response_ms else "Server was unreachable during the latest health check"
        dashboard_url = f"{settings.app_base_url.rstrip('/')}/dashboard"
        alert_heading = "Initial incident alert" if alert_kind == "initial" else "Repeated incident reminder"
        action_line = (
            "This is the first alert for the incident."
            if alert_kind == "initial"
            else f"The issue is still active. Reminder interval: every {settings.email_alert_repeat_minutes} minutes."
        )
        return f"""Server Alert Notification

Alert Type: {alert_heading}
Server Name: {name}
Server URL: {url}
Current Status: {status.upper()}
{response_info}
First Detected: {self._format_timestamp(started_at)}
Latest Check: {self._format_timestamp(current_time)}
Issue Duration: {self._format_duration(duration)}

{action_line}
Dashboard: {dashboard_url}
"""

    def _get_recipients(self) -> list[str]:
        raw_recipients = settings.admin_email.strip()
        if not raw_recipients:
            return []
        normalized = raw_recipients.replace(";", ",").replace("\n", ",")
        return [email.strip() for email in normalized.split(",") if email.strip()]

    def _format_duration(self, duration: timedelta) -> str:
        total_seconds = max(int(duration.total_seconds()), 0)
        if total_seconds < 60:
            return "less than 1 minute"

        minutes, _ = divmod(total_seconds, 60)
        hours, minutes = divmod(minutes, 60)

        if hours:
            hour_label = "hour" if hours == 1 else "hours"
            minute_label = "minute" if minutes == 1 else "minutes"
            return f"{hours} {hour_label} {minutes} {minute_label}"

        minute_label = "minute" if minutes == 1 else "minutes"
        return f"{minutes} {minute_label}"

    def _format_timestamp(self, value: datetime) -> str:
        return value.strftime("%Y-%m-%d %H:%M:%S UTC")

    async def _send_email(self, subject: str, body: str, recipients: list[str]) -> bool:
        if not settings.smtp_user or not recipients:
            logger.info("Email not configured - skipping alert")
            return False

        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = settings.smtp_user
            msg["To"] = ", ".join(recipients)
            msg.set_content(body)

            await aiosmtplib.send(
                msg,
                recipients=recipients,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                username=settings.smtp_user,
                password=settings.smtp_password,
                start_tls=True,
            )
            logger.info("Email alert sent to %s", ", ".join(recipients))
            return True
        except Exception as e:
            logger.error("Failed to send email: %s", str(e))
            return False
