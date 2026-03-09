from pydantic_settings import BaseSettings
from pathlib import Path
import logging

logger = logging.getLogger(__name__)

# Get .env file path (in backend directory)
_env_path = Path(__file__).parent.parent.parent / ".env"
_env_path_str = str(_env_path.resolve())


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+asyncpg://postgres:password@localhost/server_monitor"
    
    # JWT - reads from SECRET_KEY in .env
    secret_key: str = "your-secret-key-change-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 480
    
    # Default Admin
    default_admin_email: str = "admin@servermonitor.com"
    default_admin_password: str = "Admin@123"
    
    # Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_user: str = ""
    smtp_password: str = ""
    admin_email: str = ""
    
    # Monitoring
    slow_threshold_ms: int = 2000
    check_interval_seconds: int = 30
    email_alert_delay_minutes: int = 0  # Delay before sending email alert (0 = immediate)

    # App links (used in emails and deployment)
    app_base_url: str = "http://localhost:5173"

    # Debug
    enable_debug_endpoints: bool = False
    
    # Redis
    redis_url: str = "redis://localhost:6379"

    class Config:
        env_file = _env_path_str
        env_file_encoding = "utf-8"
        case_sensitive = False


def _normalize_database_url(database_url: str) -> str:
    if database_url.startswith("postgres://"):
        return database_url.replace("postgres://", "postgresql+asyncpg://", 1)
    if database_url.startswith("postgresql://"):
        return database_url.replace("postgresql://", "postgresql+asyncpg://", 1)
    return database_url


# Remove cache - always get fresh settings
def get_settings() -> Settings:
    settings = Settings()
    settings.database_url = _normalize_database_url(settings.database_url)
    # Log minimal config details once without exposing secrets.
    if not hasattr(get_settings, '_logged'):
        logger.info(f"Settings loaded from: {_env_path_str}")
        logger.info(f"DATABASE_URL dialect: {settings.database_url.split('://')[0]}")
        if settings.secret_key == "your-secret-key-change-in-production":
            logger.error("WARNING: Using default SECRET_KEY! .env file might not be loaded!")
        get_settings._logged = True
    return settings
