from typing import TYPE_CHECKING
from sqlmodel import Relationship, SQLModel, Field
from datetime import datetime, date as _date, time as _time
from fastapi import UploadFile, File
from typing import Optional
from enum import Enum

if TYPE_CHECKING:
    from . import ClubModel, RegistrationModel


class EventType(str, Enum):
    TECHNICAL = "TECHNICAL"
    CULTURAL = "CULTURAL"
    SPORTS = "SPORTS"
    WORKSHOP = "WORKSHOP"
    SEMINAR = "SEMINAR"
    OTHER = "OTHER"


class _BaseEvent(SQLModel):
    name: str = Field(max_length=255, min_length=3)
    description: str = Field(min_length=3)
    rules: str | None = Field(default=None)
    date: _date | None = Field(default=None)
    time: _time | None = Field(default=None)
    venue: str | None = Field(default=None)
    draft: bool = False
    team_size: int | None = Field(default=None)
    registration_url: str | None = Field(default=None)
    registration_id: int | None = Field(default=None, foreign_key="registrations.id")
    # New fields
    is_featured: bool = Field(default=False)
    event_type: EventType = Field(default=EventType.OTHER)
    tagline: str | None = Field(default=None)
    application_open: datetime | None = Field(default=None)
    application_close: datetime | None = Field(default=None)


class EventModel(_BaseEvent, table=True):
    __tablename__ = "events"  # type: ignore
    id: int | None = Field(default=None, primary_key=True, index=True)
    club_id: int = Field(foreign_key="clubs.id")
    poster: str | None = Field(default=None)
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: datetime = Field(default_factory=datetime.now)
    deleted_at: datetime | None = Field(default=None)
    club: "ClubModel" = Relationship(back_populates="events")
    registration: Optional["RegistrationModel"] = Relationship(
        back_populates="event",
        sa_relationship_kwargs={
            "uselist": False,
            "foreign_keys": "[EventModel.registration_id]",
        },
    )


class Event(_BaseEvent):
    id: int = Field(...)
    poster: str | None = Field(default=None)
    created_at: datetime = Field(...)
    updated_at: datetime = Field(...)
    club_id: int = Field(...)


class EventPopulated(Event):
    club: "Club | None" = None
    registration: "Registration | None" = None


class EventCreate(SQLModel):
    name: str = Field(max_length=255, min_length=3)
    description: str = Field(min_length=3)
    rules: str | None = Field(default=None)
    date: _date | None = Field(default=None)
    time: _time | None = Field(default=None)
    venue: str | None = Field(default=None)
    team_size: int | None = Field(default=None)
    registration_url: str | None = Field(default=None)
    draft: bool = False
    poster: UploadFile = Field(default=File(...))
    club_id: int | None = Field(default=None)
    # New fields
    is_featured: bool = Field(default=False)
    event_type: EventType = Field(default=EventType.OTHER)
    tagline: str | None = Field(default=None)
    application_open: datetime | None = Field(default=None)
    application_close: datetime | None = Field(default=None)


class EventUpdate(SQLModel):
    name: str | None = Field(default=None, max_length=255, min_length=3)
    description: str | None = Field(default=None, min_length=3)
    rules: str | None = Field(default=None)
    date: _date | None = Field(default=None)
    time: _time | None = Field(default=None)
    venue: str | None = Field(default=None)
    team_size: int | None = Field(default=None)
    registration_url: str | None = Field(default=None)
    draft: bool | None = Field(default=None)
    # New fields
    is_featured: bool | None = Field(default=None)
    event_type: EventType | None = Field(default=None)
    tagline: str | None = Field(default=None)
    application_open: datetime | None = Field(default=None)
    application_close: datetime | None = Field(default=None)


from .club import Club
from .registration import Registration

EventPopulated.model_rebuild()
