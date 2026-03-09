from sqlmodel import select
from src.db.session import async_session
from src.models.server import Server
from src.services.monitor_service import MonitorService
from src.services.smart_logger import SmartLogger
from src.services.email_service import EmailService
from src.services.log_service import LogService
from src.websocket.manager import manager
from src.core.constants import STATUS_UP

smart_logger = SmartLogger()
email_service = EmailService()
monitor_service = MonitorService()


async def run_monitoring_cycle():
    async with async_session() as session:
        result = await session.execute(select(Server).where(Server.is_active == True))
        servers = result.scalars().all()
        
        statuses = []
        for server in servers:
            status, response_ms = await monitor_service.check_server(server.url)
            statuses.append({"id": server.id, "name": server.name, 
                            "status": status, "response_ms": response_ms})
            
            await _handle_status(session, server, status, response_ms)
        
        await manager.broadcast({"type": "status_update", "servers": statuses})


async def _handle_status(session, server, status: str, response_ms: int | None):
    if status == STATUS_UP:
        email_service.clear_alert(server.id)
        return
    
    if smart_logger.should_log(server.id, status):
        log_service = LogService(session)
        msg = f"Server {status}: {response_ms}ms" if response_ms else f"Server {status}"
        await log_service.create_log(server.id, status, response_ms, msg)
        await email_service.send_alert(server.id, server.name, server.url, status, response_ms)
