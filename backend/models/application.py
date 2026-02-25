from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel, UniqueConstraint
from datetime import datetime

if TYPE_CHECKING:
    from . import StudentModel, RegistrationModel, ApplicationFieldModel


class _BaseApplication(SQLModel):
    student_id: int = Field(index=True, foreign_key="students.id")
    registration_id: int = Field(index=True, foreign_key="registrations.id")


class ApplicationModel(_BaseApplication, table=True):
    __table_args__ = (UniqueConstraint("student_id", "registration_id"),)
    __tablename__ = "applications"  # type: ignore
    id: int | None = Field(default=None, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: datetime | None = None
    student: "StudentModel" = Relationship(back_populates="applications")
    registration: "RegistrationModel" = Relationship(back_populates="applications")
    fields: list["ApplicationFieldModel"] = Relationship(back_populates="application")


class Application(_BaseApplication):
    id: int = Field(...)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ApplicationPopulated(Application):
    student: "Student"
    registration: "Registration"
    fields: list["ApplicationField"]


class ApplicationCreate(_BaseApplication):
    pass

from .student import Student
from .registration import Registration
from .application_field import ApplicationField
ApplicationPopulated.model_rebuild()
