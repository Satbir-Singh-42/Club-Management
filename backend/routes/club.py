from typing import Annotated, Optional
from fastapi import (
    APIRouter,
    File,
    Depends,
    HTTPException,
    Query,
    status,
)
from backend.lib.auth import get_user_auth
from backend.database import DBSession
from backend.models.club import Club, ClubModel, ClubCreate, ClubPopulated, ClubUpdate
from backend.models.admin import AdminModel
from sqlmodel import select, col, desc
from pydantic import BaseModel
from backend.lib.auth import get_password_hash
import os
from uuid import uuid4
from datetime import datetime


class ClubQueryParams(BaseModel):
    name: Optional[str] = None
    acronym: Optional[str] = None
    tagline: Optional[str] = None
    description: Optional[str] = None
    sort_by: Optional[str] = None
    skip: int = 0
    limit: int = 10


app = APIRouter(
    prefix="/clubs",
    tags=["Clubs"],
)


@app.post("/new", response_model=ClubPopulated, status_code=status.HTTP_201_CREATED)
async def create_club(
    data: Annotated[ClubCreate, File()],
    session: DBSession,
    current_user: Annotated[AdminModel | None, Depends(get_user_auth)] = None,
):
    # Check for existing club
    existing_club = session.exec(
        select(ClubModel).where(
            (ClubModel.email == data.email) | (ClubModel.acronym == data.acronym)
        )
    ).first()
    if existing_club:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A club with this email or acronym already exists.",
        )

    # Hash the password
    hashed_password = get_password_hash(data.password)

    # Ensure directories exist
    storage_dir = "storage"
    logo_dir = os.path.join(storage_dir, "logo")
    featured_dir = os.path.join(storage_dir, "featured")
    os.makedirs(logo_dir, exist_ok=True)
    os.makedirs(featured_dir, exist_ok=True)

    # Save logo file
    logo_filename = f"{uuid4()}.jpg"
    logo_path = os.path.join(logo_dir, logo_filename)
    with open(logo_path, "wb") as f:
        f.write(await data.logo.read())

    # Save featured image if provided
    featured_image_path = None
    if data.featured_image:
        featured_filename = f"{uuid4()}.jpg"
        featured_image_path = os.path.join(featured_dir, featured_filename)
        with open(featured_image_path, "wb") as f:
            f.write(await data.featured_image.read())

    # Create club model
    new_club = ClubModel(
        email=data.email,
        name=data.name,
        acronym=data.acronym,
        password=hashed_password,
        tagline=data.tagline,
        description=data.description,
        instagram_url=data.instagram_url,
        logo=logo_filename,
        faculty_advisor_name=data.faculty_advisor_name,
        faculty_advisor_contact=data.faculty_advisor_contact,
        convenor_name=data.convenor_name,
        convenor_contact=data.convenor_contact,
        highlights=data.highlights,
        featured_image=featured_image_path,
        website=data.website,
        all_details_completed=all([
            data.name, data.description, data.tagline,
            data.faculty_advisor_name, data.faculty_advisor_contact,
            data.convenor_name, data.convenor_contact
        ])
    )

    session.add(new_club)
    session.commit()
    session.refresh(new_club)

    return new_club


@app.get("/{club_id}", response_model=ClubPopulated)
async def get_club(club_id: int, session: DBSession):
    query = (
        select(ClubModel)
        .where(ClubModel.id == club_id)
        .where(ClubModel.deleted_at.is_(None))
    )
    club = session.exec(query).first()
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Club not found"
        )
    return club


@app.get("/", response_model=list[ClubPopulated])
async def get_clubs(
    params: Annotated[ClubQueryParams, Depends()],
    session: DBSession,
    current_user: Annotated[AdminModel | None, Depends(get_user_auth)] = None,
):
    query = select(ClubModel).where(ClubModel.deleted_at.is_(None))

    # Apply filters
    if params.name:
        query = query.where(col(ClubModel.name).contains(params.name))
    if params.acronym:
        query = query.where(col(ClubModel.acronym).contains(params.acronym))
    if params.tagline:
        query = query.where(col(ClubModel.tagline).contains(params.tagline))
    if params.description:
        query = query.where(col(ClubModel.description).contains(params.description))

    # Apply sorting
    if params.sort_by:
        if params.sort_by.startswith("-"):
            query = query.order_by(desc(getattr(ClubModel, params.sort_by[1:])))
        else:
            query = query.order_by(getattr(ClubModel, params.sort_by))

    # Apply pagination
    query = query.offset(params.skip).limit(params.limit)

    return session.exec(query).all()


@app.patch("/{club_id}", response_model=ClubPopulated)
async def update_club(
    club_id: int,
    data: Annotated[ClubUpdate, File()],
    session: DBSession,
    current_user: Annotated[AdminModel | None, Depends(get_user_auth)] = None,
):
    club = session.get(ClubModel, club_id)
    if not club or club.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Club not found"
        )

    # Only allow clubs to update their own profile or admins to update any profile
    if not isinstance(current_user, AdminModel) and (
        not isinstance(current_user, ClubModel) or current_user.id != club_id
    ):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own profile",
        )

    # Update only provided fields
    update_data = data.model_dump(exclude_unset=True)
    
    # Handle logo update if provided
    if data.logo:
        logo_filename = f"{uuid4()}.jpg"
        logo_path = os.path.join("storage", "logo", logo_filename)
        with open(logo_path, "wb") as f:
            f.write(await data.logo.read())
        update_data["logo"] = logo_filename

    # Handle featured image update if provided
    if data.featured_image:
        featured_filename = f"{uuid4()}.jpg"
        featured_path = os.path.join("storage", "featured", featured_filename)
        with open(featured_path, "wb") as f:
            f.write(await data.featured_image.read())
        update_data["featured_image"] = featured_filename

    for key, value in update_data.items():
        setattr(club, key, value)

    # Update all_details_completed status
    club.all_details_completed = all([
        club.name, club.description, club.tagline,
        club.faculty_advisor_name, club.faculty_advisor_contact,
        club.convenor_name, club.convenor_contact
    ])

    club.updated_at = datetime.now()
    session.add(club)
    session.commit()
    session.refresh(club)

    return club


@app.delete("/{club_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_club(
    club_id: int,
    session: DBSession,
    current_user: Annotated[AdminModel, Depends(get_user_auth)],
):
    # Only admins can delete clubs
    if not isinstance(current_user, AdminModel):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can delete clubs",
        )

    club = session.get(ClubModel, club_id)
    if not club or club.deleted_at is not None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Club not found"
        )

    # Soft delete
    club.deleted_at = datetime.now()
    session.add(club)
    session.commit()

    return None


@app.delete("/{club_id}/permanent", status_code=status.HTTP_204_NO_CONTENT)
async def permanent_delete_club(
    club_id: int,
    current_user: Annotated[ClubModel, Depends(get_user_auth)],
    session: DBSession,
):
    # Verify user is the club being deleted
    if not isinstance(current_user, ClubModel) or current_user.id != club_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own club profile",
        )

    club = session.get(ClubModel, club_id)
    if not club:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Club not found"
        )

    # Delete logo file if it exists
    if club.logo:
        logo_path = os.path.join("storage", "logo", club.logo)
        if os.path.exists(logo_path):
            try:
                os.remove(logo_path)
            except OSError:
                print(f"Failed to delete logo file: {logo_path}")

    # Delete featured image if it exists
    if club.featured_image:
        featured_path = os.path.join("storage", "featured", club.featured_image)
        if os.path.exists(featured_path):
            try:
                os.remove(featured_path)
            except OSError:
                print(f"Failed to delete featured image: {featured_path}")

    # Permanent delete
    session.delete(club)
    session.commit()

    return None
