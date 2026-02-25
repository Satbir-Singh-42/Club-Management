from datetime import datetime
from typing import TYPE_CHECKING
from pydantic import EmailStr
from pydantic_extra_types.phone_numbers import PhoneNumber
from sqlmodel import SQLModel, Field, Relationship, UniqueConstraint
from enum import Enum
from fastapi import UploadFile

if TYPE_CHECKING:
    from . import ApplicationModel, VerificationModel, PasswordResetModel


class Branch(str, Enum):
    CSE = "CSE"
    ECE = "ECE"
    ME = "ME"
    CE = "CE"
    EE = "EE"
    IT = "IT"


class Gender(str, Enum):
    M = "M"
    F = "F"


class _BaseStudent(SQLModel):
    email: EmailStr = Field(max_length=255, index=True, unique=True, min_length=5)
    name: str | None = Field(default=None, max_length=255, min_length=3)
    crn: str | None = Field(
        default=None, max_length=7, index=True, unique=True, min_length=7
    )
    urn: str | None = Field(
        default=None, max_length=7, index=True, unique=True, min_length=7
    )
    branch: Branch | None = Field(default=None)
    gender: Gender | None = Field(default=None)
    batch: int | None = Field(default=None, gt=1900, lt=3000)


class StudentModel(_BaseStudent, table=True):
    __table_args__ = (
        UniqueConstraint("email"),
        UniqueConstraint("crn"),
        UniqueConstraint("urn"),
    )
    __tablename__ = "students"  # type: ignore
    id: int | None = Field(default=None, primary_key=True, index=True)
    password: str = Field(max_length=255, min_length=8)
    applications: list["ApplicationModel"] = Relationship(back_populates="student")
    verifications: list["VerificationModel"] = Relationship(back_populates="student")
    password_resets: list["PasswordResetModel"] = Relationship(
        back_populates="student"
    )  # For StudentModel
    phone: str | None = Field(default=None)
    profile_photo: str | None = Field(default=None)
    all_details_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: datetime | None = Field(default=None)
    verified_at: datetime | None = Field(default=None)


class Student(_BaseStudent):
    id: int = Field(...)
    phone: str | None = None
    profile_photo: str | None = None
    all_details_completed: bool = Field(default=False)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    verified_at: datetime | None = Field(default=None)


class StudentPopulated(Student):
    applications: list["Application"]


class StudentCreate(SQLModel):
    email: EmailStr = Field(max_length=255, min_length=5)
    name: str | None = Field(default=None, max_length=255, min_length=3)
    password: str = Field(..., max_length=255, min_length=8)
    crn: str | None = Field(default=None, max_length=7, min_length=7)
    urn: str | None = Field(default=None, max_length=7, min_length=7)
    branch: Branch | None = Field(default=None)
    gender: Gender | None = Field(default=None)
    batch: int | None = Field(default=None, gt=1900, lt=3000)
    phone: str | None = Field(default=None)
    profile_photo: UploadFile | None = Field(default=None)


class StudentUpdate(SQLModel):
    email: EmailStr | None = Field(default=None, max_length=255, min_length=5)
    name: str | None = Field(default=None, max_length=255, min_length=3)
    password: str | None = Field(default=None, max_length=255, min_length=8)
    crn: str | None = Field(default=None, max_length=7, min_length=7)
    urn: str | None = Field(default=None, max_length=7, min_length=7)
    branch: Branch | None = Field(default=None)
    gender: Gender | None = Field(default=None)
    batch: int | None = Field(default=None, gt=1900, lt=3000)
    phone: str | None = Field(default=None)
    profile_photo: UploadFile | None = Field(default=None)


from .application import Application

StudentPopulated.model_rebuild()
