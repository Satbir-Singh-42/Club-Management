from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from . import ApplicationModel, RegistrationFieldModel


class _BaseApplicationField(SQLModel):
    application_id: int = Field(index=True, foreign_key="applications.id")
    registration_field_id: int = Field(index=True, foreign_key="registration_fields.id")
    value: str


class ApplicationFieldModel(_BaseApplicationField, table=True):
    __tablename__ = "application_fields"  # type: ignore
    id: int | None = Field(default=None, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: datetime | None = None
    application: "ApplicationModel" = Relationship(back_populates="fields")
    registration_field: "RegistrationFieldModel" = Relationship(back_populates="values")


class ApplicationField(_BaseApplicationField):
    id: int = Field(...)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class ApplicationFieldPopulated(ApplicationField):
    registration_field: "RegistrationField"
    application: "Application"

from .application import Application
from .registration_field import RegistrationField
ApplicationFieldPopulated.model_rebuild()
