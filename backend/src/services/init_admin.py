from sqlmodel import select
from src.models.user import User
from src.core.config import get_settings
from src.core.security import hash_password
from src.core.constants import ROLE_ADMIN

settings = get_settings()


async def create_default_admin(session):
    """Create default admin user if not exists"""
    result = await session.execute(
        select(User).where(User.email == settings.default_admin_email)
    )
    existing = result.scalar_one_or_none()
    
    if not existing:
        admin = User(
            email=settings.default_admin_email,
            hashed_password=hash_password(settings.default_admin_password),
            role=ROLE_ADMIN,
            is_active=True
        )
        session.add(admin)
        await session.commit()
        print(f"Default admin created: {settings.default_admin_email}")
    else:
        print(f"Admin already exists: {settings.default_admin_email}")
