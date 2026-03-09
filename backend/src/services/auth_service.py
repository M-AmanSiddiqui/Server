from sqlmodel import select
from src.models.user import User
from src.schemas.user import UserCreate
from src.core.security import hash_password, verify_password, create_access_token


class AuthService:
    def __init__(self, session):
        self.session = session

    async def create_user(self, data: UserCreate) -> User | None:
        existing = await self.session.execute(
            select(User).where(User.email == data.email)
        )
        if existing.scalar_one_or_none():
            return None
        
        user = User(
            email=data.email,
            hashed_password=hash_password(data.password),
            role=data.role
        )
        self.session.add(user)
        await self.session.commit()
        await self.session.refresh(user)
        return user

    async def authenticate(self, email: str, password: str) -> str | None:
        result = await self.session.execute(select(User).where(User.email == email))
        user = result.scalar_one_or_none()
        
        if not user or not verify_password(password, user.hashed_password):
            return None
        return create_access_token({"sub": user.id, "role": user.role})
