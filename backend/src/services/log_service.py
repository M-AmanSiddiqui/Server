from sqlmodel import select
from datetime import datetime
from src.models.event_log import EventLog


class LogService:
    def __init__(self, session):
        self.session = session

    async def get_logs(
        self,
        server_id: int | None = None,
        status: str | None = None,
        start_date: datetime | None = None,
        end_date: datetime | None = None,
        limit: int = 100
    ) -> list[EventLog]:
        query = select(EventLog).order_by(EventLog.logged_at.desc())
        
        if server_id:
            query = query.where(EventLog.server_id == server_id)
        if status:
            query = query.where(EventLog.status == status)
        if start_date:
            query = query.where(EventLog.logged_at >= start_date)
        if end_date:
            query = query.where(EventLog.logged_at <= end_date)
        
        query = query.limit(limit)
        result = await self.session.execute(query)
        return result.scalars().all()

    async def create_log(self, server_id: int, status: str, response_ms: int | None, msg: str):
        log = EventLog(
            server_id=server_id, status=status,
            response_time_ms=response_ms, message=msg
        )
        self.session.add(log)
        await self.session.commit()
        return log
