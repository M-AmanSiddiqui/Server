from sqlmodel import SQLModel, Field
from datetime import datetime


class EventLog(SQLModel, table=True):
    __tablename__ = "event_logs"
    
    id: int | None = Field(default=None, primary_key=True)
    server_id: int = Field(foreign_key="servers.id", index=True)
    status: str  # "down" or "slow"
    response_time_ms: int | None = None
    message: str | None = None
    logged_at: datetime = Field(default_factory=datetime.utcnow)
