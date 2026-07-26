from datetime import datetime, timedelta, timezone
from typing import Optional, List
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from jwt.exceptions import InvalidTokenError
from pydantic import BaseModel
from passlib.context import CryptContext
from sqlalchemy.orm import Session
import logging

from app.core.config import settings
from app.core.database import get_db, get_redis
from app.models.pg_models import UserModel

logger = logging.getLogger("sentinelai")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl=f"{settings.API_V1_STR}/auth/login")
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

class TokenData(BaseModel):
    user_id: Optional[str] = None
    tenant_id: Optional[str] = None
    role: Optional[str] = None
    permissions: List[str] = []

# Password hashing utilities
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)

# Token generation
def create_access_token(data: dict, expires_delta: Optional[timedelta] = None) -> str:
    to_encode = data.copy()
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire, "type": "access"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

def create_refresh_token(data: dict) -> str:
    to_encode = data.copy()
    # Refresh token lasts 7 days
    expire = datetime.now(timezone.utc) + timedelta(days=7)
    to_encode.update({"exp": expire, "type": "refresh"})
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm="HS256")
    return encoded_jwt

# Token validation
async def get_current_user(
    token: str = Depends(oauth2_scheme),
    redis = Depends(get_redis),
    db: Session = Depends(get_db)
) -> TokenData:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Check if token exists in Redis blacklist
        if redis and redis.sismember("token_blacklist", token):
            logger.warning("Revoked token attempted login validation.")
            raise credentials_exception

        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "access":
            raise credentials_exception
            
        user_id: str = payload.get("sub")
        tenant_id: str = payload.get("tenant_id")
        role: str = payload.get("role")
        permissions: List[str] = payload.get("permissions", [])
        
        if user_id is None or tenant_id is None or role is None:
            raise credentials_exception
            
        # Verify user still exists in database
        db_user = db.query(UserModel).filter(UserModel.id == user_id).first()
        if not db_user:
            raise credentials_exception
            
        token_data = TokenData(
            user_id=user_id,
            tenant_id=tenant_id,
            role=role,
            permissions=permissions
        )
        return token_data
    except InvalidTokenError:
        raise credentials_exception

class PermissionChecker:
    def __init__(self, required_permission: str):
        self.required_permission = required_permission

    def __call__(self, current_user: TokenData = Depends(get_current_user)) -> TokenData:
        if current_user.role == "SUPER_ADMIN":
            return current_user
            
        if self.required_permission not in current_user.permissions:
            logger.warning(f"User {current_user.user_id} denied permission: {self.required_permission}")
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Operation requires permission: {self.required_permission}"
            )
        return current_user
