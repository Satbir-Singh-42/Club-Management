from datetime import timedelta
from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from pydantic import BaseModel

from backend.config import ACCESS_TOKEN_EXPIRE_MINUTES
from backend.database import DBSession
from backend.models.student import Student, StudentModel
from backend.models.club import Club, ClubModel
from backend.models.admin import Admin, AdminModel
from backend.lib.auth import (
    authenticate_user,
    create_access_token,
    get_user_auth,
)

app = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


class Token(BaseModel):
    access_token: str
    token_type: str


@app.post("/token", response_model=Token)
async def login(
    form_data: Annotated[OAuth2PasswordRequestForm, Depends()], session: DBSession
):
    user = authenticate_user(form_data.username, form_data.password, session)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    # Check user type
    if isinstance(user, StudentModel):
        type = "student"
    elif isinstance(user, ClubModel):
        type = "club"
    else:
        type = "admin"
    
    data = {"sub": user.email, "type": type}
    access_token_expires = timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(data=data, expires_delta=access_token_expires)
    return Token(access_token=access_token, token_type="bearer")


@app.get("/me", response_model=Student | Club | Admin)
def get_current_user(
    current_user: Annotated[StudentModel | ClubModel | AdminModel, Depends(get_user_auth)],
):
    return current_user
