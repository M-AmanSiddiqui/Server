from fastapi import FastAPI, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import asyncio
import logging
from src.db.database import init_db
from src.db.session import async_session
from src.api.routes import auth, servers, logs, reports
from src.websocket.handlers import websocket_endpoint
from src.tasks.scheduler import start_scheduler, stop_scheduler
from src.services.init_admin import create_default_admin

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Verify settings on startup
    from src.core.config import get_settings
    settings = get_settings()
    logger = logging.getLogger(__name__)
    logger.info("=" * 50)
    logger.info("SERVER STARTUP - Settings Verification")
    logger.info(f"SECRET_KEY loaded: {settings.secret_key[:20]}...")
    logger.info(f"SECRET_KEY length: {len(settings.secret_key)}")
    logger.info(f"Expected: D9vYp6X3K8qfJ1mWz0hRltQyBNbMvF2E")
    if settings.secret_key != "D9vYp6X3K8qfJ1mWz0hRltQyBNbMvF2E":
        logger.warning("SECRET_KEY mismatch! Check .env file")
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


@app.get("/")
async def root():
    return {"message": "Server Monitor API is running"}


@app.get("/debug/settings")
async def debug_settings():
    """Debug endpoint to check SECRET_KEY"""
    from src.core.config import get_settings
    settings = get_settings()
    return {
        "secret_key_length": len(settings.secret_key),
        "secret_key_preview": settings.secret_key[:20] + "...",
        "secret_key_expected": "D9vYp6X3K8qfJ1mWz0hRltQyBNbMvF2E",
        "secret_key_match": settings.secret_key == "D9vYp6X3K8qfJ1mWz0hRltQyBNbMvF2E",
        "algorithm": settings.algorithm,
        "token_expire_minutes": settings.access_token_expire_minutes
    }


@app.post("/debug/test-token")
async def test_token_creation():
    """Test endpoint to create and validate a token"""
    from src.core.security import create_access_token, decode_token
    from src.core.config import get_settings
    
    settings = get_settings()
    
    # Create a test token
    test_data = {"sub": 1, "role": "admin"}
    token = create_access_token(test_data)
    
    # Try to decode it
    payload = decode_token(token)
    
    return {
        "token_created": bool(token),
        "token_length": len(token) if token else 0,
        "token_preview": token[:30] + "..." if token else None,
        "token_decoded": bool(payload),
        "payload": payload,
        "secret_key_used": settings.secret_key[:20] + "...",
        "secret_key_match": settings.secret_key == "D9vYp6X3K8qfJ1mWz0hRltQyBNbMvF2E"
    }


@app.get("/debug/slow")
async def debug_slow(delay_ms: int = 3000):
    """Testing endpoint to simulate a slow but healthy server."""
    await asyncio.sleep(max(delay_ms, 0) / 1000)
    return {"status": "ok", "delay_ms": delay_ms}


@app.websocket("/ws/status")
async def status_websocket(websocket: WebSocket):
    await websocket_endpoint(websocket)
