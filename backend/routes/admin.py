from typing import Annotated
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from ..database import DBSession
from ..lib.auth import require_admin, get_password_hash
from ..models.admin import AdminModel, Admin

router = APIRouter(prefix="/admin", tags=["admin"])


@router.post("/", response_model=Admin, status_code=status.HTTP_201_CREATED)
async def create_admin(
    *,
    session: DBSession,
    current_admin: Annotated[AdminModel, Depends(require_admin)],
    email: str,
    name: str,
    password: str,
):
    """Only existing admins can create new admin accounts"""
    # Check if admin already exists
    existing = session.exec(
        select(AdminModel).where(AdminModel.email == email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Admin with this email already exists",
        )

    # Create new admin
    admin = AdminModel(
        email=email,
        name=name,
        password=get_password_hash(password),
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


@router.get("/me", response_model=Admin)
async def get_current_admin(
    current_admin: Annotated[AdminModel, Depends(require_admin)],
):
    """Get current admin's profile"""
    return current_admin