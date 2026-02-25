from typing import TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime

if TYPE_CHECKING:
    from . import EventModel, RegistrationFieldModel, ApplicationModel


class _BaseRegistration(SQLModel):
    open: bool = Field(default=True)


class RegistrationModel(_BaseRegistration, table=True):
    __tablename__ = "registrations"  # type: ignore
    id: int | None = Field(default=None, primary_key=True, index=True)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: datetime | None = None
    event: "EventModel" = Relationship(
        back_populates="registration", sa_relationship_kwargs={"uselist": False}
    )
    fields: list["RegistrationFieldModel"] = Relationship(back_populates="registration")
    applications: list["ApplicationModel"] = Relationship(back_populates="registration")


class Registration(_BaseRegistration):
    id: int = Field(...)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)


class RegistrationPopulated(Registration):
    event: "Event"
    fields: list["RegistrationField"]
    applications: list["Application"]

from .event import Event
from .registration_field import RegistrationField
from .application import Application
RegistrationPopulated.model_rebuild()
