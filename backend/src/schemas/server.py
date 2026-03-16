from pydantic import BaseModel, HttpUrl
from datetime import datetime


class ServerCreate(BaseModel):
    name: str
    url: str


class ServerUpdate(BaseModel):
    name: str | None = None
    url: str | None = None
    is_active: bool | None = None


class ServerResponse(BaseModel):
    id: int
    name: str
    url: str
    is_active: bool
    created_at: datetime
