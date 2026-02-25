from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models.registration import (
    Registration,
    RegistrationModel,
    RegistrationPopulated,
)
from ..models.registration_field import (
    RegistrationField,
    RegistrationFieldModel,
    RegistrationFieldPopulated,
    FieldType,
)
from ..models.event import EventModel

router = APIRouter(prefix="/registrations", tags=["registrations"])

# Registration Routes
@router.post("/", response_model=Registration)
def create_registration(*, session: Session = Depends(get_session), event_id: int):
    # Check if event exists
    event = session.get(EventModel, event_id)
    if not event:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Event with id {event_id} not found",
        )
    
    # Check if registration already exists for event
    existing = session.exec(
        select(RegistrationModel).where(
            RegistrationModel.event.has(id=event_id)
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Registration already exists for event {event_id}",
        )

    registration = RegistrationModel(open=True)
    event.registration = registration
    session.add(registration)
    session.commit()
    session.refresh(registration)
    return registration

@router.get("/{registration_id}", response_model=RegistrationPopulated)
def get_registration(*, session: Session = Depends(get_session), registration_id: int):
    registration = session.get(RegistrationModel, registration_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with id {registration_id} not found",
        )
    return registration

@router.put("/{registration_id}", response_model=Registration)
def update_registration(
    *,
    session: Session = Depends(get_session),
    registration_id: int,
    open: bool,
):
    registration = session.get(RegistrationModel, registration_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with id {registration_id} not found",
        )
    
    registration.open = open
    session.add(registration)
    session.commit()
    session.refresh(registration)
    return registration

@router.delete("/{registration_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_registration(*, session: Session = Depends(get_session), registration_id: int):
    registration = session.get(RegistrationModel, registration_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with id {registration_id} not found",
        )
    
    session.delete(registration)
    session.commit()

# Registration Field Routes
@router.post("/{registration_id}/fields", response_model=RegistrationField)
def create_registration_field(
    *,
    session: Session = Depends(get_session),
    registration_id: int,
    name: str,
    description: str | None = None,
    type: FieldType,
    required: bool = False,
):
    registration = session.get(RegistrationModel, registration_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with id {registration_id} not found",
        )
    
    field = RegistrationFieldModel(
        registration_id=registration_id,
        name=name,
        description=description,
        type=type,
        required=required,
    )
    session.add(field)
    session.commit()
    session.refresh(field)
    return field

@router.get("/{registration_id}/fields", response_model=List[RegistrationFieldPopulated])
def get_registration_fields(
    *, session: Session = Depends(get_session), registration_id: int
):
    registration = session.get(RegistrationModel, registration_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with id {registration_id} not found",
        )
    return registration.fields

@router.put("/{registration_id}/fields/{field_id}", response_model=RegistrationField)
def update_registration_field(
    *,
    session: Session = Depends(get_session),
    registration_id: int,
    field_id: int,
    name: str | None = None,
    description: str | None = None,
    type: FieldType | None = None,
    required: bool | None = None,
):
    field = session.get(RegistrationFieldModel, field_id)
    if not field or field.registration_id != registration_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field with id {field_id} not found for registration {registration_id}",
        )
    
    if name is not None:
        field.name = name
    if description is not None:
        field.description = description
    if type is not None:
        field.type = type
    if required is not None:
        field.required = required
    
    session.add(field)
    session.commit()
    session.refresh(field)
    return field

@router.delete(
    "/{registration_id}/fields/{field_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_registration_field(
    *, session: Session = Depends(get_session), registration_id: int, field_id: int
):
    field = session.get(RegistrationFieldModel, field_id)
    if not field or field.registration_id != registration_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field with id {field_id} not found for registration {registration_id}",
        )
    
    session.delete(field)
    session.commit() 