from typing import Annotated, Optional
from fastapi import APIRouter, Depends, File, HTTPException, status
from backend.database import DBSession
from backend.models.event import EventModel, EventCreate, EventPopulated, EventUpdate
from backend.models.club import ClubModel
from backend.models.admin import AdminModel
from backend.lib.auth import get_user_auth
from sqlmodel import col, select, desc
from pydantic import BaseModel
from datetime import datetime
import os
from uuid import uuid4
from fastapi.security import OAuth2PasswordBearer


class EventQueryParams(BaseModel):
    club_id: Optional[int] = None
    name: Optional[str] = None
    venue: Optional[str] = None
    date: Optional[str] = None
    time: Optional[str] = None
    start_time: Optional[str] = None
    end_time: Optional[str] = None
    sort_by: Optional[str] = None
    start_date: Optional[str] = None
    end_date: Optional[str] = None
    search: Optional[str] = None
    skip: int = 0
    limit: int = 10


app = APIRouter(
    prefix="/events",
    tags=["Events"],
)

# Create an optional OAuth2 scheme
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="/auth/token", auto_error=False)


@app.post("/new", response_model=EventPopulated)
async def create_event(
    data: Annotated[EventCreate, File()],
    current_user: Annotated[ClubModel | AdminModel, Depends(get_user_auth)],
    session: DBSession,
):
    # Only clubs and admins can create events
    if not isinstance(current_user, (ClubModel, AdminModel)):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clubs and admins can create events",
        )

    if isinstance(current_user, ClubModel) and current_user.id is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN, detail="Club not found"
        )

    # Ensure the storage and posters directories exist
    storage_dir = "storage"
    posters_dir = os.path.join(storage_dir, "posters")
    os.makedirs(posters_dir, exist_ok=True)

    # Save the poster image to the server
    poster_filename = f"{uuid4()}.jpg"
    poster_path = os.path.join(posters_dir, poster_filename)
    with open(poster_path, "wb") as f:
        f.write(await data.poster.read())

    # Only admins can set featured status
    if not isinstance(current_user, AdminModel):
        data.is_featured = False

    event_model = EventModel(
        name=data.name,
        description=data.description,
        rules=data.rules,
        draft=data.draft,
        date=data.date,
        time=data.time,
        venue=data.venue,
        team_size=data.team_size,
        registration_url=data.registration_url,
        club_id=(
            current_user.id if isinstance(current_user, ClubModel) else data.club_id
        ),
        poster=poster_path,
        is_featured=data.is_featured,
        event_type=data.event_type,
        tagline=data.tagline,
        application_open=data.application_open,
        application_close=data.application_close,
    )

    session.add(event_model)
    session.commit()
    session.refresh(event_model)

    return event_model


@app.get("/drafts/events", response_model=list[EventPopulated])
async def get_draft_events(
    session: DBSession,
    current_user: Annotated[ClubModel | AdminModel, Depends(get_user_auth)],
    club_id: int | None = None,
):
    """Get draft events for the authenticated club or admin."""
    query = (
        select(EventModel)
        .where(EventModel.draft == True)
        .where(EventModel.deleted_at.is_(None))
    )

    if isinstance(current_user, ClubModel):
        query = query.where(EventModel.club_id == current_user.id)
    elif club_id:
        query = query.where(EventModel.club_id == club_id)

    return session.exec(query).all()


@app.get("/{event_id}", response_model=EventPopulated)
async def get_event(event_id: int, session: DBSession):
    query = (
        select(EventModel)
        .where(EventModel.id == event_id)
        .where(EventModel.deleted_at.is_(None))
    )
    event = session.exec(query).first()
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )
    return event


@app.get("/", response_model=list[EventPopulated])
async def get_events(
    params: Annotated[EventQueryParams, Depends()],
    session: DBSession,
    token: str | None = Depends(oauth2_scheme_optional),
):
    query = select(EventModel).where(EventModel.deleted_at.is_(None))

    # Apply filters
    if params.club_id:
        query = query.where(EventModel.club_id == params.club_id)
    if params.name:
        query = query.where(col(EventModel.name).contains(params.name))
    if params.venue:
        query = query.where(col(EventModel.venue).contains(params.venue))
    if params.date:
        query = query.where(EventModel.date == params.date)
    if params.time:
        query = query.where(EventModel.time == params.time)
    if params.start_date:
        query = query.where(EventModel.date >= params.start_date)
    if params.end_date:
        query = query.where(EventModel.date <= params.end_date)
    if params.start_time:
        query = query.where(EventModel.time >= params.start_time)
    if params.end_time:
        query = query.where(EventModel.time <= params.end_time)
    if params.search:
        query = query.where(
            col(EventModel.name).contains(params.search)
            | col(EventModel.description).contains(params.search)
            | col(EventModel.venue).contains(params.search)
        )

    # Apply sorting
    if params.sort_by:
        if params.sort_by.startswith("-"):
            query = query.order_by(desc(getattr(EventModel, params.sort_by[1:])))
        else:
            query = query.order_by(getattr(EventModel, params.sort_by))

    # Apply pagination
    query = query.offset(params.skip).limit(params.limit)

    return session.exec(query).all()


@app.patch("/{event_id}", response_model=EventPopulated)
async def update_event(
    event_id: int,
    data: Annotated[EventUpdate, Form()],
    session: DBSession,
    current_user: Annotated[ClubModel | AdminModel, Depends(get_user_auth)],
):
    # Get the event
    event = session.get(EventModel, event_id)
    if not event or event.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    # Check if the current user has permission to update the event
    if not isinstance(current_user, AdminModel) and (
        not isinstance(current_user, ClubModel) or event.club_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own events",
        )

    # Only admins can update featured status
    if not isinstance(current_user, AdminModel) and data.is_featured is not None:
        data.is_featured = event.is_featured

    # Update only provided fields
    update_data = data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(event, key, value)

    event.updated_at = datetime.now()
    session.add(event)
    session.commit()
    session.refresh(event)

    return event


@app.delete("/{event_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_event(
    event_id: int,
    session: DBSession,
    current_user: Annotated[ClubModel | AdminModel, Depends(get_user_auth)],
):
    # Get the event
    event = session.get(EventModel, event_id)
    if not event or event.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    # Check if the current user has permission to delete the event
    if not isinstance(current_user, AdminModel) and (
        not isinstance(current_user, ClubModel) or event.club_id != current_user.id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own events",
        )

    # Soft delete
    event.deleted_at = datetime.now()
    session.add(event)
    session.commit()

    return None


@app.delete("/{event_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanent_delete_event(
    event_id: int,
    current_user: Annotated[ClubModel, Depends(get_user_auth)],
    session: DBSession,
):
    # Only clubs can permanently delete events
    if not isinstance(current_user, ClubModel):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only clubs can permanently delete events",
        )

    # Get the event
    event = session.get(EventModel, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Event not found"
        )

    # Check if the current user owns the event
    if event.club_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own events",
        )

    # Delete the poster file if it exists
    if event.poster and os.path.exists(event.poster):
        try:
            os.remove(event.poster)
        except OSError:
            # Log the error but continue with deletion
            print(f"Failed to delete poster file: {event.poster}")

    # Permanent delete
    session.delete(event)
    session.commit()

    return None
