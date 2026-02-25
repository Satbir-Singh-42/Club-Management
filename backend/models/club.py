from typing import TYPE_CHECKING
from pydantic import EmailStr
from sqlmodel import SQLModel, Field, Relationship, UniqueConstraint
from fastapi import UploadFile, File
from datetime import datetime

if TYPE_CHECKING:
    from . import EventModel, PasswordResetModel


class _BaseClub(SQLModel):
    email: EmailStr = Field(max_length=255, index=True, unique=True, min_length=5)
    name: str = Field(max_length=255, min_length=3)
    acronym: str = Field(max_length=10, min_length=2, index=True, unique=True)
    tagline: str | None = Field(default=None)
    description: str | None = Field(default=None)
    instagram_url: str | None = Field(default=None)
    faculty_advisor_name: str | None = Field(default=None)
    faculty_advisor_contact: str | None = Field(default=None)
    convenor_name: str | None = Field(default=None)
    convenor_contact: str | None = Field(default=None)
    highlights: str | None = Field(default=None)
    featured_image: str | None = Field(default=None)
    website: str | None = Field(default=None)
    all_details_completed: bool = Field(default=False)


class ClubModel(_BaseClub, table=True):
    __table_args__ = (UniqueConstraint("email"), UniqueConstraint("acronym"))
    __tablename__ = "clubs"  # type: ignore
    id: int | None = Field(default=None, primary_key=True, index=True)
    logo: str
    password: str = Field(max_length=255, min_length=8)
    events: list["EventModel"] = Relationship(back_populates="club")
    password_resets: list["PasswordResetModel"] = Relationship(
        back_populates="club"
    )  # For ClubModel
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: datetime | None = Field(default=None)


class Club(_BaseClub):
    id: int = Field(...)
    logo: str
    created_at: datetime
    updated_at: datetime


class ClubPopulated(Club):
    events: list["Event"]


class ClubCreate(_BaseClub):
    logo: UploadFile = Field(default=File(...))
    password: str = Field(..., max_length=255, min_length=8)
    faculty_advisor_name: str | None = Field(default=None)
    faculty_advisor_contact: str | None = Field(default=None)
    convenor_name: str | None = Field(default=None)
    convenor_contact: str | None = Field(default=None)
    highlights: str | None = Field(default=None)
    featured_image: UploadFile | None = Field(default=None)
    website: str | None = Field(default=None)


class ClubUpdate(SQLModel):
    password: str | None = Field(default=None, max_length=255)
    email: EmailStr | None = Field(default=None, max_length=255, min_length=5)
    name: str | None = Field(default=None, max_length=255, min_length=3)
    acronym: str | None = Field(default=None, max_length=10, min_length=2)
    tagline: str | None = Field(default=None)
    description: str | None = Field(default=None)
    instagram_url: str | None = Field(default=None)
    logo: UploadFile | None = Field(default=None)
    faculty_advisor_name: str | None = Field(default=None)
    faculty_advisor_contact: str | None = Field(default=None)
    convenor_name: str | None = Field(default=None)
    convenor_contact: str | None = Field(default=None)
    highlights: str | None = Field(default=None)
    featured_image: UploadFile | None = Field(default=None)
    website: str | None = Field(default=None)


from .event import Event

ClubPopulated.model_rebuild()
