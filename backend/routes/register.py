from typing import Annotated
from fastapi import APIRouter, Form, HTTPException, BackgroundTasks
from datetime import datetime, timedelta
from sqlmodel import select
from sqlmodel.sql.expression import or_

from backend.database import DBSession
from backend.lib.auth import get_password_hash
from backend.lib.email import send_verification_email
from backend.models.student import (
    StudentCreate,
    StudentModel,
)
from backend.models.verification import VerificationModel

app = APIRouter(
    prefix="/register",
    tags=["Registration"],
)


@app.post("/", response_model=dict, status_code=201)
def register_student(
    data: Annotated[StudentCreate, Form()],
    background_tasks: BackgroundTasks,
    session: DBSession,
):
    try:
        # First check specifically for email existence
        existing_email = session.exec(
            select(StudentModel).where(
                StudentModel.email == data.email,
                StudentModel.deleted_at.is_(None),  # Only check active accounts
            )
        ).first()

        if existing_email:
            if existing_email.verified_at:
                raise HTTPException(
                    status_code=409,
                    detail=[
                        {
                            "loc": ["body", "email"],
                            "msg": "This email address is already registered and verified.",
                            "type": "value_error.email.exists",
                        }
                    ],
                )
            else:
                # Handle unverified existing account
                # Delete old verification records
                verifications = session.exec(
                    select(VerificationModel).where(
                        VerificationModel.student_id == existing_email.id
                    )
                ).all()
                for vf in verifications:
                    session.delete(vf)

                # Delete the unverified student
                session.delete(existing_email)
                session.commit()

        # Check for other unique constraints (CRN, URN)
        if data.crn or data.urn:
            existing_student = session.exec(
                select(StudentModel).where(
                    or_(
                        StudentModel.crn == data.crn if data.crn else False,
                        StudentModel.urn == data.urn if data.urn else False,
                    ),
                    StudentModel.deleted_at.is_(None),
                )
            ).first()

            if existing_student:
                if existing_student.crn == data.crn:
                    raise HTTPException(
                        status_code=409,
                        detail=[
                            {
                                "loc": ["body", "crn"],
                                "msg": "This CRN is already registered.",
                                "type": "value_error.crn.exists",
                            }
                        ],
                    )
                if existing_student.urn == data.urn:
                    raise HTTPException(
                        status_code=409,
                        detail=[
                            {
                                "loc": ["body", "urn"],
                                "msg": "This URN is already registered.",
                                "type": "value_error.urn.exists",
                            }
                        ],
                    )
        # Hash Password
        data.password = get_password_hash(data.password)
        # Create new student
        student = StudentModel.model_validate(data)
        session.add(student)
        session.commit()
        session.refresh(student)
        if student.id is None:
            raise HTTPException(
                status_code=500,
                detail=[
                    {
                        "loc": ["body"],
                        "msg": "An unexpected error occurred.",
                        "type": "server_error",
                    }
                ],
            )
        # Create verification record
        verification = VerificationModel(
            student_id=student.id,
            otp=VerificationModel.generate_otp(),
            expires_at=datetime.now() + timedelta(minutes=15),
        )
        session.add(verification)
        session.commit()
        # Send verification email
        background_tasks.add_task(
            send_verification_email, student.email, verification.otp
        )
        return {
            "message": "Registration successful. Please check your email for verification code",
            "student_id": student.id,
        }

    except HTTPException as e:
        raise e
    except Exception as e:
        session.rollback()
        print(f"Registration error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail=[
                {
                    "loc": ["body"],
                    "msg": "An unexpected error occurred during registration.",
                    "type": "server_error",
                }
            ],
        )


@app.post("/verify", response_model=dict)
def verify_email(
    student_id: Annotated[int, Form()],
    otp: Annotated[str, Form()],
    session: DBSession,
):
    try:
        # Get the student
        student = session.get(StudentModel, student_id)
        if not student:
            raise HTTPException(
                status_code=404,
                detail=[
                    {
                        "loc": ["body", "student_id"],
                        "msg": "Student not found",
                        "type": "not_found_error",
                    }
                ],
            )

        # Check if already verified
        if student.verified_at is not None:
            raise HTTPException(
                status_code=400,
                detail=[
                    {
                        "loc": ["body"],
                        "msg": "Email already verified",
                        "type": "validation_error",
                    }
                ],
            )

        # Get the latest verification record
        verification = session.exec(
            select(VerificationModel)
            .where(VerificationModel.student_id == student_id)
            .order_by(VerificationModel.created_at.desc())
        ).first()

        if not verification:
            raise HTTPException(
                status_code=404,
                detail=[
                    {
                        "loc": ["body"],
                        "msg": "No verification code found. Please request a new one.",
                        "type": "not_found_error",
                    }
                ],
            )

        # Check attempts
        if verification.attempts >= VerificationModel.MAX_ATTEMPTS:
            raise HTTPException(
                status_code=400,
                detail=[
                    {
                        "loc": ["body"],
                        "msg": "Too many failed attempts. Please request a new verification code.",
                        "type": "validation_error.max_attempts",
                    }
                ],
            )

        # Increment attempts
        verification.attempts += 1
        session.add(verification)
        session.commit()

        # Check expiration
        if datetime.now() > verification.expires_at:
            raise HTTPException(
                status_code=400,
                detail=[
                    {
                        "loc": ["body"],
                        "msg": "Verification code has expired. Please request a new one.",
                        "type": "validation_error.expired",
                    }
                ],
            )

        # Check OTP
        if verification.otp != otp:
            raise HTTPException(
                status_code=400,
                detail=[
                    {
                        "loc": ["body", "otp"],
                        "msg": f"Invalid verification code. {VerificationModel.MAX_ATTEMPTS - verification.attempts} attempts remaining.",
                        "type": "validation_error.invalid_otp",
                    }
                ],
            )

        # Update student verification status
        student.verified_at = datetime.now()
        session.add(student)

        # Clean up verification records for this student
        verifications = session.exec(
            select(VerificationModel).where(VerificationModel.student_id == student_id)
        ).all()
        for v in verifications:
            session.delete(v)

        session.commit()

        return {"message": "Email verified successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        session.rollback()
        print(e)
        raise HTTPException(
            status_code=500,
            detail=[
                {
                    "loc": ["body"],
                    "msg": "An unexpected error occurred",
                    "type": "server_error",
                }
            ],
        )


@app.post("/resend-verification", response_model=dict)
def resend_verification(
    student_id: Annotated[int, Form()],
    background_tasks: BackgroundTasks,
    session: DBSession,
):
    try:
        student = session.get(StudentModel, student_id)
        if not student:
            raise HTTPException(
                status_code=404,
                detail=[{"loc": ["body", "student_id"], "msg": "Student not found"}],
            )

        if student.verified_at is not None:
            raise HTTPException(
                status_code=400,
                detail=[{"loc": ["body"], "msg": "Email already verified"}],
            )

        # Delete existing verification records
        verifications = session.exec(
            select(VerificationModel).where(VerificationModel.student_id == student_id)
        ).all()
        for v in verifications:
            session.delete(v)

        # Create new verification record
        verification = VerificationModel(
            student_id=student_id,
            otp=VerificationModel.generate_otp(),
            expires_at=datetime.now() + timedelta(minutes=15),
        )
        session.add(verification)
        session.commit()

        # Send verification email
        background_tasks.add_task(
            send_verification_email, student.email, verification.otp
        )

        return {"message": "Verification code resent successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        session.rollback()
        print(e)
        raise HTTPException(
            status_code=500,
            detail=[{"loc": ["body"], "msg": "An unexpected error occurred"}],
        )
