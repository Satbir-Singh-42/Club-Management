import os
from typing import Annotated
from fastapi import Depends, HTTPException, status
import jwt
import bcrypt
from fastapi.security import OAuth2PasswordBearer
from sqlmodel import select
from datetime import datetime, timedelta

from backend.config import ACCESS_TOKEN_EXPIRE_MINUTES, HASHING_ALGORITHM
from backend.database import DBSession
from backend.models import StudentModel, ClubModel, AdminModel


oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/token")


def verify_password(plain_password, hashed_password):
    return bcrypt.checkpw(
        plain_password.encode("utf-8"), hashed_password.encode("utf-8")
    )


def get_password_hash(password):
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def authenticate_user(
    email: str, password: str, session: DBSession
) -> StudentModel | ClubModel | AdminModel | None:
    # Use passed session instead of creating new one
    student_query = select(StudentModel).where(StudentModel.email == email)
    user = session.exec(student_query).first()
    if not user:
        # Search for match in club table
        club_query = select(ClubModel).where(ClubModel.email == email)
        user = session.exec(club_query).first()
        if not user:
            # Search for match in admin table
            admin_query = select(AdminModel).where(AdminModel.email == email)
            user = session.exec(admin_query).first()
            if not user:
                return None
    # Verify password
    if not verify_password(password, user.password):
        return None
    return user


def create_access_token(data: dict, expires_delta: timedelta | None = None) -> str:
    to_encode = data.copy()
    # Add expiration time
    if expires_delta:
        expire = datetime.now() + expires_delta
    else:
        expire = datetime.now() + timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    to_encode.update({"exp": expire})
    key = os.getenv("HASHING_SECRET_KEY")
    if not key:
        raise ValueError("HASHING_SECRET_KEY not set in .env")
    encoded_jwt = jwt.encode(to_encode, key, algorithm=HASHING_ALGORITHM)
    return encoded_jwt


def get_user_auth(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: DBSession,
) -> StudentModel | ClubModel | AdminModel:
    def credentials_exception(e):
        return HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: " + str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )

    try:
        payload = jwt.decode(
            token, os.getenv("HASHING_SECRET_KEY"), algorithms=[HASHING_ALGORITHM]
        )
        type: str = payload.get("type")
        email: str = payload.get("sub")
        if email is None:
            raise credentials_exception("Invalid token data")

        if type == "student":
            student_query = select(StudentModel).where(StudentModel.email == email)
            user = session.exec(student_query).first()
        elif type == "club":
            club_query = select(ClubModel).where(ClubModel.email == email)
            user = session.exec(club_query).first()
        elif type == "admin":
            admin_query = select(AdminModel).where(AdminModel.email == email)
            user = session.exec(admin_query).first()
        else:
            raise credentials_exception("Invalid user type")

        if not user:
            raise credentials_exception("User not found")

        return user
    except jwt.PyJWTError as e:
        print(f"JWT Error: {e}")
        raise credentials_exception(e)
    except Exception as e:
        print(f"Auth Error: {e}")
        raise credentials_exception(e)


def get_user_type(token: Annotated[str, Depends(oauth2_scheme)]) -> str:
    try:
        payload = jwt.decode(
            token, os.getenv("HASHING_SECRET_KEY"), algorithms=[HASHING_ALGORITHM]
        )
        type: str = payload.get("type")
        return type
    except jwt.PyJWTError as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: " + str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials: " + str(e),
            headers={"WWW-Authenticate": "Bearer"},
        )


def require_admin(
    token: Annotated[str, Depends(oauth2_scheme)],
    session: DBSession,
) -> AdminModel:
    user = get_user_auth(token, session)
    if not isinstance(user, AdminModel):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return user
