import logging
from datetime import datetime, timedelta
from html import escape

import aiohttp

from src.core.config import get_settings

settings = get_settings()
logger = logging.getLogger(__name__)


class ElasticEmailService:
    def __init__(self):
        # {server_id: {"status": str, "started_at": datetime, "last_sent_at": datetime | None}}
        self.active_alerts: dict[int, dict[str, datetime | str | None]] = {}
        self.repeat_interval = timedelta(minutes=max(settings.alert_repeat_minutes, 1))

    async def send_alert(
        self,
        server_id: int,
        server_name: str,
        server_url: str,
        status: str,
        response_ms: int | None,
    ) -> bool:
        recipients = self._get_recipients()
        if not self._is_configured(recipients):
            return False

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

        if isinstance(last_sent_at, datetime) and now - last_sent_at < self.repeat_interval:
            return False

        duration = now - started_at
        subject = self._build_subject(server_name, status, duration, alert_kind)
        text_body = self._build_text_body(
            name=server_name,
            url=server_url,
            status=status,
            response_ms=response_ms,
            started_at=started_at,
            current_time=now,
            duration=duration,
            alert_kind=alert_kind,
        )
        html_body = self._build_html_body(
            name=server_name,
            url=server_url,
            status=status,
            response_ms=response_ms,
            started_at=started_at,
            current_time=now,
            duration=duration,
            alert_kind=alert_kind,
        )

        if await self._send_email(subject, text_body, html_body, recipients):
            self.active_alerts[server_id] = {
                "status": status,
                "started_at": started_at,
                "last_sent_at": now,
            }
            return True

        return False

    def clear_alert(self, server_id: int):
        self.active_alerts.pop(server_id, None)

    def _is_configured(self, recipients: list[str]) -> bool:
        return bool(
            settings.elastic_email_api_key
            and settings.elastic_email_base_url
            and settings.elastic_email_from_email
            and recipients
        )

    def _get_recipients(self) -> list[str]:
        raw_recipients = settings.alert_recipients.strip()
        if not raw_recipients:
            return []
        normalized = raw_recipients.replace(";", ",").replace("\n", ",")
        return [email.strip() for email in normalized.split(",") if email.strip()]

    def _build_subject(self, name: str, status: str, duration: timedelta, alert_kind: str) -> str:
        status_label = status.upper()
        if alert_kind == "initial":
            return f"[ALERT] {name} is {status_label}"
        return f"[REMINDER] {name} still {status_label} for {self._format_duration(duration)}"

    def _build_text_body(
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
        intro = (
            "Server needs attention."
            if alert_kind == "initial"
            else "Issue is still active. Reminder email."
        )
        response_info = (
            f"Observed response time: {response_ms}ms"
            if response_ms is not None
            else "Observed response time: unavailable"
        )
        return "\n".join(
            [
                intro,
                "",
                f"Server: {name}",
                f"Link: {url}",
                f"Status: {status.upper()}",
                response_info,
                f"First detected: {self._format_timestamp(started_at)}",
                f"Latest check: {self._format_timestamp(current_time)}",
                f"Issue duration: {self._format_duration(duration)}",
            ]
        )

    def _build_html_body(
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
        intro = (
            "Server needs attention."
            if alert_kind == "initial"
            else "Issue is still active. Reminder email."
        )
        response_info = (
            f"{response_ms}ms" if response_ms is not None else "Unavailable"
        )
        safe_name = escape(name)
        safe_url = escape(url)
        safe_status = escape(status.upper())
        return (
            "<html><body style='font-family:Arial,sans-serif;'>"
            f"<p>{escape(intro)}</p>"
            "<ul>"
            f"<li><strong>Server:</strong> {safe_name}</li>"
            f"<li><strong>Link:</strong> <a href='{safe_url}'>{safe_url}</a></li>"
            f"<li><strong>Status:</strong> {safe_status}</li>"
            f"<li><strong>Observed response time:</strong> {escape(response_info)}</li>"
            f"<li><strong>First detected:</strong> {escape(self._format_timestamp(started_at))}</li>"
            f"<li><strong>Latest check:</strong> {escape(self._format_timestamp(current_time))}</li>"
            f"<li><strong>Issue duration:</strong> {escape(self._format_duration(duration))}</li>"
            "</ul>"
            "</body></html>"
        )

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

    async def _send_email(
        self,
        subject: str,
        text_body: str,
        html_body: str,
        recipients: list[str],
    ) -> bool:
        payload = {
            "Recipients": {
                "To": recipients,
            },
            "Content": {
                "From": settings.elastic_email_from_email,
                "Subject": subject,
                "Body": [
                    {
                        "ContentType": "HTML",
                        "Charset": "utf-8",
                        "Content": html_body,
                    },
                    {
                        "ContentType": "PlainText",
                        "Charset": "utf-8",
                        "Content": text_body,
                    },
                ],
            },
        }
        headers = {
            "X-ElasticEmail-ApiKey": settings.elastic_email_api_key,
            "Content-Type": "application/json",
        }
        endpoint = f"{settings.elastic_email_base_url.rstrip('/')}/emails/transactional"

        try:
            timeout = aiohttp.ClientTimeout(total=20)
            async with aiohttp.ClientSession(timeout=timeout) as session:
                async with session.post(endpoint, json=payload, headers=headers) as response:
                    if 200 <= response.status < 300:
                        logger.info("Elastic Email alert sent to %s", ", ".join(recipients))
                        return True

                    error_text = await response.text()
                    logger.error(
                        "Elastic Email send failed (%s): %s",
                        response.status,
                        error_text[:500],
                    )
                    return False
        except Exception as exc:
            logger.error("Elastic Email request failed: %s", str(exc))
            return False
