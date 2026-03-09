import pandas as pd
from datetime import datetime, timedelta
from sqlmodel import select
from src.models.event_log import EventLog
from src.models.server import Server
from src.services.report_csv import to_csv
from src.services.report_pdf import to_pdf


class ReportService:
    def __init__(self, session):
        self.session = session

    async def generate(self, period: str, format: str):
        start_date = self._get_start_date(period)
        logs = await self._fetch_logs(start_date)
        servers = await self._fetch_servers()
        df = self._build_dataframe(logs, servers)
        
        if format == "csv":
            return to_csv(df, period)
        return to_pdf(df, period)  # to_pdf is not async

    def _get_start_date(self, period: str) -> datetime:
        now = datetime.utcnow()
        days = {"daily": 1, "weekly": 7, "monthly": 30}
        return now - timedelta(days=days[period])

    async def _fetch_logs(self, start_date: datetime):
        query = select(EventLog).where(EventLog.logged_at >= start_date)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def _fetch_servers(self):
        result = await self.session.execute(select(Server))
        # Return dict with both name and URL: {server_id: {"name": "...", "url": "..."}}
        return {s.id: {"name": s.name, "url": s.url} for s in result.scalars().all()}

    def _build_dataframe(self, logs, servers) -> pd.DataFrame:
        data = []
        for l in logs:
            server_info = servers.get(l.server_id, {"name": "Unknown", "url": "N/A"})
            data.append({
                "server": server_info.get("name", "Unknown"),
                "url": server_info.get("url", "N/A"),
                "status": l.status,
                "response_ms": l.response_time_ms,
                "time": l.logged_at
            })
        return pd.DataFrame(data) if data else pd.DataFrame()
