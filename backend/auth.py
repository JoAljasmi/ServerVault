import bcrypt
import secrets
from datetime import datetime, timedelta, timezone
from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from database import get_db


# ============= Password Hashing ==============

def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))
# ============= Db Token ==============

TOKEN_EXPIRE_HOURS = 24

def create_token(user_id: int, db: Session) -> str:
    """generates random token to the database"""
    from models import UserSession
    
    token = secrets.token_hex(32)
    current_session = UserSession(token=token, user_id=user_id)
    db.add(current_session)
    db.commit()
    return token

# ============= Get current user ==============

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login")

def get_current_user(
        token: str = Depends(oauth2_scheme),
          db:Session = Depends(get_db)):
    """look up the token and return the user """

    from models import UserSession, User

    current_session = db.query(UserSession).filter(UserSession.token == token).first()
    
    if not current_session:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    #checking if the token is expired
    if datetime.now(timezone.utc) - current_session.created_at.replace(tzinfo=timezone.utc) > timedelta(hours=TOKEN_EXPIRE_HOURS):
        db.delete(current_session)
        db.commit()
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token expired",
            headers={"WWW-Authenticate": "Bearer"},
        )
    #fetching the user
    user = db.query(User).filter(User.id == current_session.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user

def delete_token(token: str, db: Session):
    """delete the token (logout)"""
    from models import UserSession

    current_session = db.query(UserSession).filter(UserSession.token == token).first()
    if current_session:
        db.delete(current_session)
        db.commit()