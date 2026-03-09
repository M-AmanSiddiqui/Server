from fastapi import APIRouter, Depends, Query
from datetime import datetime
from src.schemas.event_log import EventLogResponse
from src.services.log_service import LogService
from src.db.session import get_session

router = APIRouter(prefix="/logs", tags=["Logs"])


@router.get("/", response_model=list[EventLogResponse])
async def get_logs(
    server_id: int | None = None,
    status: str | None = None,
    start_date: datetime | None = None,
    end_date: datetime | None = None,
    limit: int = Query(default=100, le=1000),
    session=Depends(get_session)
):
    """Public endpoint - anyone can view logs"""
    service = LogService(session)
    return await service.get_logs(server_id, status, start_date, end_date, limit)


@router.get("/server/{server_id}", response_model=list[EventLogResponse])
async def get_server_logs(
    server_id: int,
    limit: int = Query(default=50, le=500),
    session=Depends(get_session)
):
    """Public endpoint - anyone can view server logs"""
    service = LogService(session)
    return await service.get_logs(server_id=server_id, limit=limit)
