from datetime import datetime
from typing import TYPE_CHECKING, ClassVar
from sqlmodel import SQLModel, Field, Relationship
import random
import string

if TYPE_CHECKING:
    from . import StudentModel


class VerificationModel(SQLModel, table=True):
    __tablename__ = "verifications"  # type: ignore
    id: int | None = Field(default=None, primary_key=True)
    student_id: int = Field(foreign_key="students.id")
    otp: str = Field(max_length=6)
    expires_at: datetime = Field(...)
    created_at: datetime = Field(default_factory=datetime.now)
    student: "StudentModel" = Relationship(back_populates="verifications")
    attempts: int = Field(default=0)  # Track verification attempts
    MAX_ATTEMPTS: ClassVar[int] = 3  # Maximum attempts allowed

    @staticmethod
    def generate_otp(length: int = 6) -> str:
        return "".join(random.choices(string.digits, k=length))


class Verification(SQLModel):
    id: int
    otp: str
    expires_at: datetime
