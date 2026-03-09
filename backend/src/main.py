from fastapi import FastAPI, HTTPException, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import asyncio
import logging
from pathlib import Path
from src.db.database import init_db
from src.db.session import async_session
from src.core.config import get_settings
from src.api.routes import auth, servers, logs, reports
from src.websocket.handlers import websocket_endpoint
from src.tasks.scheduler import start_scheduler, stop_scheduler
from src.services.init_admin import create_default_admin

PROJECT_ROOT = Path(__file__).resolve().parents[2]
FRONTEND_DIST = PROJECT_ROOT / "frontend" / "dist"
FRONTEND_INDEX = FRONTEND_DIST / "index.html"
logger = logging.getLogger(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    settings = get_settings()
    logger.info("=" * 50)
    logger.info("Server startup")
    logger.info("Debug endpoints enabled: %s", settings.enable_debug_endpoints)
    if FRONTEND_INDEX.exists():
        logger.info("Frontend build found at %s", FRONTEND_DIST)
    else:
        logger.warning("Frontend build not found at %s", FRONTEND_DIST)
    logger.info("=" * 50)
    
    await init_db()
    async with async_session() as session:
        await create_default_admin(session)
    start_scheduler()
    yield
    stop_scheduler()


app = FastAPI(title="Server Monitor", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:3000",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)

app.include_router(auth.router, prefix="/api")
app.include_router(servers.router, prefix="/api")
app.include_router(logs.router, prefix="/api")
app.include_router(reports.router, prefix="/api")


@app.get("/health")
async def health():
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
async def root():
    if FRONTEND_INDEX.exists():
        return FileResponse(FRONTEND_INDEX)
    return {"message": "Server Monitor API is running"}


if get_settings().enable_debug_endpoints:
    @app.get("/debug/settings")
    async def debug_settings():
        settings = get_settings()
        return {
            "secret_key_length": len(settings.secret_key),
            "algorithm": settings.algorithm,
            "token_expire_minutes": settings.access_token_expire_minutes,
        }


    @app.post("/debug/test-token")
    async def test_token_creation():
        from src.core.security import create_access_token, decode_token

        test_data = {"sub": 1, "role": "admin"}
        token = create_access_token(test_data)
        payload = decode_token(token)

        return {
            "token_created": bool(token),
            "token_length": len(token) if token else 0,
            "token_decoded": bool(payload),
            "payload": payload,
        }


    @app.get("/debug/slow")
    async def debug_slow(delay_ms: int = 3000):
        """Testing endpoint to simulate a slow but healthy server."""
        await asyncio.sleep(max(delay_ms, 0) / 1000)
        return {"status": "ok", "delay_ms": delay_ms}


@app.websocket("/ws/status")
async def status_websocket(websocket: WebSocket):
    await websocket_endpoint(websocket)


@app.get("/{full_path:path}", include_in_schema=False)
async def serve_spa(full_path: str):
    if not FRONTEND_INDEX.exists():
        raise HTTPException(status_code=404, detail="Not Found")

    if full_path.startswith(("api", "ws", "debug", "health")):
        raise HTTPException(status_code=404, detail="Not Found")

    requested_path = (FRONTEND_DIST / full_path).resolve()
    if full_path and requested_path.is_file() and FRONTEND_DIST.resolve() in requested_path.parents:
        return FileResponse(requested_path)

    return FileResponse(FRONTEND_INDEX)
