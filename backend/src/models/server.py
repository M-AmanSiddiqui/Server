from sqlmodel import SQLModel, Field
from datetime import datetime


class Server(SQLModel, table=True):
    __tablename__ = "servers"
    
    id: int | None = Field(default=None, primary_key=True)
    name: str = Field(unique=True, index=True)
    url: str
    created_by: int | None = Field(default=None, foreign_key="users.id")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    is_active: bool = Field(default=True)
