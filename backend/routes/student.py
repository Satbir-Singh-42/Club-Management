from typing import Annotated, Optional
from fastapi import APIRouter, Depends, Form, HTTPException, status
from backend.database import DBSession
from backend.models.student import (
    StudentModel,
    StudentCreate,
    StudentPopulated,
    StudentUpdate,
    Branch,
)
from backend.lib.auth import get_user_auth, get_password_hash
from backend.models.admin import AdminModel
from sqlmodel import col, select, desc
from pydantic import BaseModel
from datetime import datetime
import os
from uuid import uuid4


class StudentQueryParams(BaseModel):
    name: Optional[str] = None
    email: Optional[str] = None
    crn: Optional[str] = None
    urn: Optional[str] = None
    branch: Optional[Branch] = None
    batch: Optional[int] = None
    sort_by: Optional[str] = None
    skip: int = 0
    limit: int = 10


app = APIRouter(
    prefix="/students",
    tags=["Students"],
)


@app.post("/new", response_model=StudentPopulated, status_code=status.HTTP_201_CREATED)
async def create_student(
    data: Annotated[StudentCreate, Form()],
    session: DBSession,
    current_user: Annotated[AdminModel | None, Depends(get_user_auth)] = None,
):
    # Check for existing student
    existing_student = session.exec(
        select(StudentModel).where(
            (StudentModel.email == data.email)
            | (StudentModel.crn == data.crn)
            | (StudentModel.urn == data.urn)
        )
    ).first()

    if existing_student:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A student with this email, CRN, or URN already exists.",
        )

    # Hash the password
    hashed_password = get_password_hash(data.password)

    # Handle profile photo if provided
    profile_photo_path = None
    if data.profile_photo:
        # Ensure directory exists
        profile_photos_dir = os.path.join("storage", "profile_photos")
        os.makedirs(profile_photos_dir, exist_ok=True)

        # Save profile photo
        photo_filename = f"{uuid4()}.jpg"
        profile_photo_path = os.path.join(profile_photos_dir, photo_filename)
        with open(profile_photo_path, "wb") as f:
            f.write(await data.profile_photo.read())

    # Create student model
    new_student = StudentModel(
        email=data.email,
        name=data.name,
        password=hashed_password,
        crn=data.crn,
        urn=data.urn,
        branch=data.branch,
        gender=data.gender,
        batch=data.batch,
        phone=str(data.phone) if data.phone else None,
        profile_photo=profile_photo_path,
        all_details_completed=all(
            [
                data.name,
                data.crn,
                data.urn,
                data.branch,
                data.gender,
                data.batch,
                data.phone,
                profile_photo_path,
            ]
        ),
    )

    session.add(new_student)
    session.commit()
    session.refresh(new_student)

    return new_student


@app.get("/{student_id}", response_model=StudentPopulated)
async def get_student(student_id: int, session: DBSession):
    query = (
        select(StudentModel)
        .where(StudentModel.id == student_id)
        .where(StudentModel.deleted_at.is_(None))
    )
    student = session.exec(query).first()
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )
    return student


@app.get("/", response_model=list[StudentPopulated])
async def get_students(
    params: Annotated[StudentQueryParams, Depends()],
    session: DBSession,
    current_user: Annotated[AdminModel | None, Depends(get_user_auth)] = None,
):
    query = select(StudentModel).where(StudentModel.deleted_at.is_(None))

    # Apply filters
    if params.name:
        query = query.where(col(StudentModel.name).contains(params.name))
    if params.email:
        query = query.where(col(StudentModel.email).contains(params.email))
    if params.crn:
        query = query.where(col(StudentModel.crn).contains(params.crn))
    if params.urn:
        query = query.where(col(StudentModel.urn).contains(params.urn))
    if params.branch:
        query = query.where(StudentModel.branch == params.branch)
    if params.batch:
        query = query.where(StudentModel.batch == params.batch)

    # Apply sorting
    if params.sort_by:
        if params.sort_by.startswith("-"):
            query = query.order_by(desc(getattr(StudentModel, params.sort_by[1:])))
        else:
            query = query.order_by(getattr(StudentModel, params.sort_by))

    # Apply pagination
    query = query.offset(params.skip).limit(params.limit)

    return session.exec(query).all()


@app.patch("/{student_id}", response_model=StudentPopulated)
async def update_student(
    student_id: int,
    data: Annotated[StudentUpdate, Form()],
    session: DBSession,
    current_user: Annotated[AdminModel | StudentModel, Depends(get_user_auth)],
):
    # Get the student
    student = session.get(StudentModel, student_id)
    if not student or student.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )

    # Check if the current user has permission to update the student
    if not isinstance(current_user, AdminModel) and (
        not isinstance(current_user, StudentModel) or current_user.id != student_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile",
        )

    # Update only provided fields
    update_data = data.model_dump(exclude_unset=True)

    # Handle profile photo update if provided
    if data.profile_photo:
        # Ensure directory exists
        profile_photos_dir = os.path.join("storage", "profile_photos")
        os.makedirs(profile_photos_dir, exist_ok=True)

        photo_filename = f"{uuid4()}.jpg"
        photo_path = os.path.join(profile_photos_dir, photo_filename)
        with open(photo_path, "wb") as f:
            f.write(await data.profile_photo.read())
        update_data["profile_photo"] = photo_path

    for key, value in update_data.items():
        setattr(student, key, value)

    # Update all_details_completed status
    student.all_details_completed = all(
        [
            student.name,
            student.crn,
            student.urn,
            student.branch,
            student.gender,
            student.batch,
            student.phone,
            student.profile_photo,
        ]
    )

    student.updated_at = datetime.now()
    session.add(student)
    session.commit()
    session.refresh(student)

    return student


@app.delete("/{student_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_student(
    student_id: int,
    session: DBSession,
    current_user: Annotated[AdminModel, Depends(get_user_auth)],
):
    # Only admins can delete students
    if not isinstance(current_user, AdminModel):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete students",
        )

    student = session.get(StudentModel, student_id)
    if not student or student.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )

    # Soft delete
    student.deleted_at = datetime.now()
    session.add(student)
    session.commit()

    return None


@app.delete("/{student_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanent_delete_student(
    student_id: int,
    current_user: Annotated[StudentModel, Depends(get_user_auth)],
    session: DBSession,
):
    # Verify user is the student being deleted
    if not isinstance(current_user, StudentModel) or current_user.id != student_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own profile",
        )

    student = session.get(StudentModel, student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Student not found"
        )

    # Delete profile photo if it exists
    if student.profile_photo:
        try:
            os.remove(student.profile_photo)
        except OSError:
            print(f"Failed to delete profile photo: {student.profile_photo}")

    # Permanent delete
    session.delete(student)
    session.commit()

    return None
