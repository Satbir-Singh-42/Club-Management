from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List

from ..database import get_session
from ..models.application import (
    Application,
    ApplicationModel,
    ApplicationPopulated,
    ApplicationCreate,
)
from ..models.application_field import (
    ApplicationField,
    ApplicationFieldModel,
    ApplicationFieldPopulated,
)
from ..models.registration import RegistrationModel
from ..models.registration_field import RegistrationFieldModel
from ..models.student import StudentModel

router = APIRouter(prefix="/applications", tags=["applications"])

# Application Routes
@router.post("/", response_model=ApplicationPopulated)
def create_application(
    *, session: Session = Depends(get_session), application: ApplicationCreate
):
    # Check if student exists
    student = session.get(StudentModel, application.student_id)
    if not student:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Student with id {application.student_id} not found",
        )
    
    # Check if registration exists and is open
    registration = session.get(RegistrationModel, application.registration_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with id {application.registration_id} not found",
        )
    if not registration.open:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Registration is closed",
        )
    
    # Check if student already applied
    existing = session.exec(
        select(ApplicationModel).where(
            ApplicationModel.student_id == application.student_id,
            ApplicationModel.registration_id == application.registration_id,
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Student has already applied for this registration",
        )
    
    db_application = ApplicationModel.model_validate(application)
    session.add(db_application)
    session.commit()
    session.refresh(db_application)
    return db_application

@router.get("/{application_id}", response_model=ApplicationPopulated)
def get_application(*, session: Session = Depends(get_session), application_id: int):
    application = session.get(ApplicationModel, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {application_id} not found",
        )
    return application

@router.get("/registration/{registration_id}", response_model=List[ApplicationPopulated])
def get_applications_by_registration(
    *, session: Session = Depends(get_session), registration_id: int
):
    registration = session.get(RegistrationModel, registration_id)
    if not registration:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration with id {registration_id} not found",
        )
    return registration.applications

@router.delete("/{application_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_application(*, session: Session = Depends(get_session), application_id: int):
    application = session.get(ApplicationModel, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {application_id} not found",
        )
    session.delete(application)
    session.commit()

# Application Field Routes
@router.post("/{application_id}/fields", response_model=ApplicationField)
def create_application_field(
    *,
    session: Session = Depends(get_session),
    application_id: int,
    registration_field_id: int,
    value: str,
):
    # Check if application exists
    application = session.get(ApplicationModel, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {application_id} not found",
        )
    
    # Check if registration field exists and belongs to the application's registration
    registration_field = session.get(RegistrationFieldModel, registration_field_id)
    if not registration_field or registration_field.registration_id != application.registration_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Registration field with id {registration_field_id} not found for this application",
        )
    
    # Check if field value already exists
    existing = session.exec(
        select(ApplicationFieldModel).where(
            ApplicationFieldModel.application_id == application_id,
            ApplicationFieldModel.registration_field_id == registration_field_id,
        )
    ).first()
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Field value already exists for this application",
        )
    
    field = ApplicationFieldModel(
        application_id=application_id,
        registration_field_id=registration_field_id,
        value=value,
    )
    session.add(field)
    session.commit()
    session.refresh(field)
    return field

@router.get("/{application_id}/fields", response_model=List[ApplicationFieldPopulated])
def get_application_fields(
    *, session: Session = Depends(get_session), application_id: int
):
    application = session.get(ApplicationModel, application_id)
    if not application:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Application with id {application_id} not found",
        )
    return application.fields

@router.put("/{application_id}/fields/{field_id}", response_model=ApplicationField)
def update_application_field(
    *,
    session: Session = Depends(get_session),
    application_id: int,
    field_id: int,
    value: str,
):
    field = session.get(ApplicationFieldModel, field_id)
    if not field or field.application_id != application_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field with id {field_id} not found for application {application_id}",
        )
    
    field.value = value
    session.add(field)
    session.commit()
    session.refresh(field)
    return field

@router.delete(
    "/{application_id}/fields/{field_id}", status_code=status.HTTP_204_NO_CONTENT
)
def delete_application_field(
    *, session: Session = Depends(get_session), application_id: int, field_id: int
):
    field = session.get(ApplicationFieldModel, field_id)
    if not field or field.application_id != application_id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Field with id {field_id} not found for application {application_id}",
        )
    session.delete(field)
    session.commit() 