from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
import secrets

if TYPE_CHECKING:
    from . import StudentModel, ClubModel

class PasswordResetModel(SQLModel, table=True):
    __tablename__ = "password_resets" # type: ignore

    id: int | None = Field(default=None, primary_key=True)
    token: str = Field(
        default_factory=lambda: secrets.token_urlsafe(32),
        index=True,
        unique=True
    )
    student_id: int | None = Field(default=None, foreign_key="students.id")
    club_id: int | None = Field(default=None, foreign_key="clubs.id")
    expires_at: datetime
    used_at: datetime | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)

    student: Optional["StudentModel"] = Relationship(back_populates="password_resets")
    club: Optional["ClubModel"] = Relationship(back_populates="password_resets")
