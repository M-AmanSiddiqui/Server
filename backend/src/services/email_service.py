import logging
from email.message import EmailMessage

import aiosmtplib

from src.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class EmailService:
    def __init__(self):
        self.sent_alerts = set()  # Track (server_id, status) to avoid spam

    async def send_alert(
        self,
        server_id: int,
        server_name: str,
        server_url: str,
        status: str,
        response_ms: int | None,
    ):
        alert_key = (server_id, status)
        if alert_key in self.sent_alerts or not settings.smtp_user:
            return

        self.sent_alerts.add(alert_key)
        subject = f"[ALERT] Server {server_name} is {status.upper()}"
        body = self._build_body(server_name, server_url, status, response_ms)

        await self._send_email(subject, body)

    def clear_alert(self, server_id: int):
        self.sent_alerts = {k for k in self.sent_alerts if k[0] != server_id}

    def _build_body(self, name: str, url: str, status: str, response_ms: int | None) -> str:
        response_info = f"Response time: {response_ms}ms" if response_ms else "Server unreachable"
        return f"""Server Alert Notification

Server Name: {name}
Server URL: {url}
Status: {status.upper()}
{response_info}

Please check the server immediately.
Dashboard: http://localhost:5173/dashboard"""

    async def _send_email(self, subject: str, body: str):
        if not settings.smtp_user or not settings.admin_email:
            logger.info("Email not configured - skipping alert")
            return

        try:
            msg = EmailMessage()
            msg["Subject"] = subject
            msg["From"] = settings.smtp_user
            msg["To"] = settings.admin_email
            msg.set_content(body)

            await aiosmtplib.send(
                msg,
                hostname=settings.smtp_host,
                port=settings.smtp_port,
                username=settings.smtp_user,
                password=settings.smtp_password,
                start_tls=True,
            )
            logger.info("Email alert sent to %s", settings.admin_email)
        except Exception as e:
            logger.error("Failed to send email: %s", str(e))
