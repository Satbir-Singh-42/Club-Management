from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from enum import Enum

if TYPE_CHECKING:
    from . import RegistrationModel, ApplicationFieldModel


class FieldType(str, Enum):
    text = "text"
    number = "number"
    email = "email"
    phone = "phone"
    date = "date"
    time = "time"
    datetime = "datetime"
    url = "url"
    file = "file"


class _BaseRegistrationField(SQLModel):
    registration_id: int = Field(index=True, foreign_key="registrations.id")
    name: str = Field(max_length=255, min_length=3)
    description: str | None = Field(default=None)
    type: FieldType
    required: bool = Field(default=False)


class RegistrationFieldModel(_BaseRegistrationField, table=True):
    __tablename__ = "registration_fields"  # type: ignore
    id: int | None = Field(default=None, primary_key=True, index=True)
    registration: "RegistrationModel" = Relationship(back_populates="fields")
    values: list["ApplicationFieldModel"] = Relationship(
        back_populates="registration_field"
    )
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: datetime | None = Field(default=None)


class RegistrationField(_BaseRegistrationField):
    id: int = Field(...)
    created_at: datetime
    updated_at: datetime


class RegistrationFieldPopulated(RegistrationField):
    registration: "Registration"
    values: list["ApplicationField"]

from .registration import Registration
from .application_field import ApplicationField
RegistrationFieldPopulated.model_rebuild()
