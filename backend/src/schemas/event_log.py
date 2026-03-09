from pydantic import BaseModel
from datetime import datetime


class EventLogResponse(BaseModel):
    id: int
    server_id: int
    status: str
    response_time_ms: int | None
    message: str | None
    logged_at: datetime


class EventLogQuery(BaseModel):
    server_id: int | None = None
    status: str | None = None
    start_date: datetime | None = None
    end_date: datetime | None = None
