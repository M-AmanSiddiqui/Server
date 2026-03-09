from datetime import datetime, timedelta
from jose import jwt, JWTError, ExpiredSignatureError
from passlib.context import CryptContext
from src.core.config import get_settings
import logging

logger = logging.getLogger(__name__)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def hash_password(password: str) -> str:
    return pwd_context.hash(password)


def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)


def create_access_token(data: dict) -> str:
    # Always get fresh settings
    current_settings = get_settings()
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(minutes=current_settings.access_token_expire_minutes)
    # JWT expects exp as Unix timestamp (seconds since epoch)
    to_encode.update({"exp": int(expire.timestamp())})
    
    logger.info(f"Creating token:")
    logger.info(f"  - SECRET_KEY length: {len(current_settings.secret_key)}")
    logger.info(f"  - SECRET_KEY preview: {current_settings.secret_key[:15]}...")
    logger.info(f"  - Algorithm: {current_settings.algorithm}")
    logger.info(f"  - Expires in: {current_settings.access_token_expire_minutes} minutes")
    
    token = jwt.encode(to_encode, current_settings.secret_key, algorithm=current_settings.algorithm)
    logger.info(f"Token created. Length: {len(token)}, Preview: {token[:30]}...")
    return token


def decode_token(token: str) -> dict | None:
    # Always get fresh settings
    current_settings = get_settings()
    
    try:
        logger.info(f"Decoding token:")
        logger.info(f"  - Token preview: {token[:30]}...")
        logger.info(f"  - Token length: {len(token)}")
        logger.info(f"  - SECRET_KEY length: {len(current_settings.secret_key)}")
        logger.info(f"  - SECRET_KEY preview: {current_settings.secret_key[:15]}...")
        logger.info(f"  - Algorithm: {current_settings.algorithm}")
        
        payload = jwt.decode(token, current_settings.secret_key, algorithms=[current_settings.algorithm])
        logger.info(f"Token decoded successfully!")
        logger.info(f"  - Payload keys: {list(payload.keys())}")
        logger.info(f"  - User ID: {payload.get('sub')}")
        logger.info(f"  - Role: {payload.get('role')}")
        logger.info(f"  - Expires at: {datetime.fromtimestamp(payload.get('exp', 0))}")
        return payload
    except ExpiredSignatureError:
        logger.warning("Token has expired")
        return None
    except JWTError as e:
        logger.error(f"JWT decode error: {str(e)}")
        logger.error(f"  - Error type: {type(e).__name__}")
        logger.error(f"  - Token preview: {token[:50]}...")
        logger.error(f"  - SECRET_KEY used: {current_settings.secret_key[:20]}...")
        logger.error(f"  - SECRET_KEY from .env should be: D9vYp6X3K8qfJ1mWz0hRltQyBNbMvF2E")
        return None
    except Exception as e:
        logger.error(f"Unexpected error decoding token: {str(e)}")
        logger.error(f"  - Error type: {type(e).__name__}")
        return None
