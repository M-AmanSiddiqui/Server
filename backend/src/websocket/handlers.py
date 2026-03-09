from fastapi import WebSocket, WebSocketDisconnect
import logging
from src.websocket.manager import manager
from src.tasks.monitor_task import run_monitoring_cycle

logger = logging.getLogger(__name__)


async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        # Push fresh statuses as soon as a client connects.
        await run_monitoring_cycle()
    except Exception as e:
        logger.error(f"Failed to run initial monitoring cycle on websocket connect: {e}")
    try:
        while True:
            data = await websocket.receive_text()
            # Handle incoming messages if needed
            await websocket.send_text(f"Received: {data}")
    except WebSocketDisconnect:
        manager.disconnect(websocket)
    except Exception:
        manager.disconnect(websocket)
