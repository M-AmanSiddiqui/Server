from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select
from src.core.security import decode_token
from src.core.constants import ROLE_ADMIN
from src.db.session import get_session
from src.models.user import User
import logging

logger = logging.getLogger(__name__)

oauth2_scheme = OAuth2PasswordBearer(
    tokenUrl="/api/auth/login",
    auto_error=False
)

# Alternative token extractor - manual extraction
async def extract_token_from_header(request: Request) -> str | None:
    """Manually extract token from Authorization header"""
    authorization = request.headers.get("authorization") or request.headers.get("Authorization")
    if authorization and authorization.startswith("Bearer "):
        return authorization.replace("Bearer ", "").strip()
    return None


async def get_current_user(
    request: Request,
    token_from_oauth: str = Depends(oauth2_scheme),
    session=Depends(get_session)
) -> User:
    import logging
    logger = logging.getLogger(__name__)
    
    logger.info("=" * 60)
    logger.info("🔐 AUTH CHECK - get_current_user called")
    
    # Start with token from OAuth2PasswordBearer
    token = token_from_oauth
    
    # If that fails, try manual extraction
    if not token:
        logger.warning("⚠️ OAuth2PasswordBearer returned no token, trying manual extraction...")
        authorization = request.headers.get("authorization") or request.headers.get("Authorization")
        logger.info(f"   Authorization header present: {bool(authorization)}")
        logger.info(f"   Authorization header: {authorization[:50] + '...' if authorization else 'MISSING'}")
        
        if authorization and authorization.startswith("Bearer "):
            token = authorization.replace("Bearer ", "").strip()
            logger.info(f"   ✅ Token extracted manually: {token[:30]}...")
        else:
            logger.error("   ❌ Manual extraction also failed")
            logger.error(f"   All header keys: {list(request.headers.keys())}")
            # Log specific headers
            for key in ['authorization', 'Authorization', 'AUTHORIZATION']:
                if key in request.headers:
                    logger.error(f"   Found header '{key}': {request.headers[key][:50]}...")
    
    logger.info(f"   Final token: {token[:30] + '...' if token else 'None'} (length: {len(token) if token else 0})")
    
    if not token:
        logger.error("❌ No token provided in request")
        logger.error("   → Check if Authorization header is being sent from frontend")
        logger.error("   → Check axios interceptor is adding token")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated - missing token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"🔑 Token received: {token[:30]}... (length: {len(token)})")
    
    payload = decode_token(token)
    if not payload:
        logger.error(f"❌ Token decode failed. Token: {token[:30]}...")
        logger.error("   → Token might be created with different SECRET_KEY")
        logger.error("   → Or token format is invalid")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token - please login again",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    logger.info(f"✅ Token decoded successfully!")
    logger.info(f"   Payload: {payload}")
    logger.info("=" * 60)
    
    user_id = payload.get("sub")
    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload - missing user ID",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"User with ID {user_id} not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account is inactive",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user


async def get_optional_user(
    request: Request,
    token_from_oauth: str | None = Depends(oauth2_scheme),
    session=Depends(get_session)
) -> User | None:
    token = token_from_oauth or await extract_token_from_header(request)
    if not token:
        return None

    payload = decode_token(token)
    if not payload:
        logger.warning("Ignoring invalid token on optional auth dependency")
        return None

    user_id = payload.get("sub")
    if not user_id:
        return None

    result = await session.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or not user.is_active:
        return None

    return user


async def require_admin(user: User = Depends(get_current_user)) -> User:
    if user.role != ROLE_ADMIN:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)
    return user
