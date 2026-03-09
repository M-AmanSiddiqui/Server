from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import OAuth2PasswordRequestForm
from src.schemas.user import UserCreate, UserResponse, Token
from src.services.auth_service import AuthService
from src.api.dependencies import require_admin
from src.db.session import get_session

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/login", response_model=Token)
async def login(
    form: OAuth2PasswordRequestForm = Depends(),
    session=Depends(get_session)
):
    service = AuthService(session)
    token = await service.authenticate(form.username, form.password)
    if not token:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    return Token(access_token=token)


@router.post("/users", response_model=UserResponse)
async def add_user(
    data: UserCreate,
    session=Depends(get_session),
    current_user=Depends(require_admin)
):
    """Admin only: Add a new user (viewer)"""
    service = AuthService(session)
    user = await service.create_user(data)
    if not user:
        raise HTTPException(status_code=400, detail="Email already exists")
    return user


@router.get("/me")
async def get_current_user_info(
    current_user=Depends(require_admin)
):
    """Debug endpoint to verify auth is working"""
    from src.core.config import get_settings
    settings = get_settings()
    return {
        "user_id": current_user.id,
        "email": current_user.email,
        "role": current_user.role,
        "secret_key_length": len(settings.secret_key),
        "secret_key_preview": settings.secret_key[:10] + "..." if len(settings.secret_key) > 10 else "too short"
    }
