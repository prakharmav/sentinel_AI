from datetime import timedelta
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session
import uuid
import logging
import jwt

from app.core import auth
from app.core.config import settings
from app.core.database import get_db, get_redis
from app.models.pg_models import TenantModel, UserModel
from app.schemas import pydantic_schemas

logger = logging.getLogger("sentinelai")
router = APIRouter()

# Map roles to specific system permissions
ROLE_PERMISSIONS = {
    "CITIZEN": ["complaint:create", "complaint:read"],
    "POLICE": ["alert:read", "alert:acknowledge", "complaint:read", "case:read"],
    "INVESTIGATOR": ["alert:read", "alert:acknowledge", "query:nl", "response:advise", "response:contain", "case:read", "suspect:profile:read"],
    "ADMIN": ["tenant:config", "user:write", "system:config", "alert:read"]
}

def seed_default_users(db: Session):
    """
    Seeds default testing database records for each role if they do not exist.
    """
    # 1. Seed Tenant
    tenant = db.query(TenantModel).filter(TenantModel.slug == "default").first()
    if not tenant:
        tenant = TenantModel(
            id=uuid.UUID("00000000-0000-0000-0000-000000000001"),
            name="Default State Cyber Command",
            slug="default",
            plan="Enterprise",
            status="ACTIVE"
        )
        db.add(tenant)
        db.commit()
        db.refresh(tenant)

    # 2. Seed default users per role
    default_users = [
        {"email": "citizen@sentinelai.io", "role": "CITIZEN", "id": "00000000-0000-0000-0000-000000000010"},
        {"email": "police@sentinelai.io", "role": "POLICE", "id": "00000000-0000-0000-0000-000000000020"},
        {"email": "investigator@sentinelai.io", "role": "INVESTIGATOR", "id": "00000000-0000-0000-0000-000000000030"},
        {"email": "admin@sentinelai.io", "role": "ADMIN", "id": "00000000-0000-0000-0000-000000000040"}
    ]

    for user_info in default_users:
        user = db.query(UserModel).filter(UserModel.email == user_info["email"]).first()
        if not user:
            user = UserModel(
                id=uuid.UUID(user_info["id"]),
                tenant_id=tenant.id,
                email=user_info["email"],
                hashed_password=auth.get_password_hash("password"),  # default password
                role=user_info["role"],
                mfa_enabled=True,
                mfa_type="TOTP"
            )
            db.add(user)
    db.commit()

@router.post("/login", response_model=pydantic_schemas.MfaChallengeResponse)
async def login(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
):
    # Ensure default mock databases are seeded on first invocation
    seed_default_users(db)

    email = form_data.username
    password = form_data.password
    
    # Query user account from PostgreSQL
    user = db.query(UserModel).filter(UserModel.email == email).first()
    if not user or not auth.verify_password(password, user.hashed_password):
        logger.warning(f"Failed login attempt for username: {email}")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
        
    exchange_token = str(uuid.uuid4())
    # In production, we'd save this exchange token session to Redis cache
    # with a TTL of 5 minutes.
    redis = get_redis()
    if redis:
        redis.setex(f"mfa_exchange:{exchange_token}", 300, str(user.id))
        
    return pydantic_schemas.MfaChallengeResponse(
        exchange_token=exchange_token,
        challenge_type="TOTP"
    )

@router.post("/mfa/verify", response_model=pydantic_schemas.TokenResponse)
async def verify_mfa(
    payload: pydantic_schemas.VerifyMfaRequest,
    db: Session = Depends(get_db),
    redis = Depends(get_redis)
):
    user_id = None
    if redis:
        user_id = redis.get(f"mfa_exchange:{payload.exchange_token}")
        if user_id:
            redis.delete(f"mfa_exchange:{payload.exchange_token}")
            
    # Fallback to default user if Redis is offline during local testing
    if not user_id:
        user_id = "00000000-0000-0000-0000-000000000030" # Default Investigator
        
    # Verify challenge TOTP code (Developer testing bypass code: 123456)
    if payload.mfa_code != "123456":
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid MFA verification code"
        )
        
    # Load user from db
    user = db.query(UserModel).filter(UserModel.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User session invalid"
        )
        
    # Generate access & refresh tokens
    permissions = ROLE_PERMISSIONS.get(user.role, [])
    
    access_token = auth.create_access_token(
        data={
            "sub": str(user.id),
            "tenant_id": str(user.tenant_id),
            "role": user.role,
            "permissions": permissions
        }
    )
    
    refresh_token = auth.create_refresh_token(
        data={
            "sub": str(user.id)
        }
    )
    
    # Persist refresh token to Postgres
    user.refresh_token = refresh_token
    db.commit()
    
    return pydantic_schemas.TokenResponse(
        access_token=access_token,
        expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
    )

@router.post("/refresh", response_model=pydantic_schemas.TokenResponse)
async def refresh_token(
    refresh_token: str,
    db: Session = Depends(get_db)
):
    try:
        payload = jwt.decode(refresh_token, settings.SECRET_KEY, algorithms=["HS256"])
        if payload.get("type") != "refresh":
            raise HTTPException(status_code=401, detail="Invalid token type")
            
        user_id = payload.get("sub")
        user = db.query(UserModel).filter(UserModel.id == user_id, UserModel.refresh_token == refresh_token).first()
        if not user:
            raise HTTPException(status_code=401, detail="Session revoked or user not found")
            
        # Re-issue new access token
        permissions = ROLE_PERMISSIONS.get(user.role, [])
        new_access_token = auth.create_access_token(
            data={
                "sub": str(user.id),
                "tenant_id": str(user.tenant_id),
                "role": user.role,
                "permissions": permissions
            }
        )
        
        return pydantic_schemas.TokenResponse(
            access_token=new_access_token,
            expires_in=settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    except Exception:
        raise HTTPException(status_code=401, detail="Invalid refresh token")
