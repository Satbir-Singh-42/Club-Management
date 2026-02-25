from datetime import datetime, timedelta
from typing import Annotated
from fastapi import APIRouter, Form, HTTPException, BackgroundTasks
from pydantic import EmailStr
from sqlmodel import select
import os

from backend.database import DBSession
from backend.lib.auth import get_password_hash
from backend.lib.email import send_password_reset_email
from backend.models.password_reset import PasswordResetModel
from backend.models.student import StudentModel
from backend.models.club import ClubModel

app = APIRouter(
    prefix="/password-reset",
    tags=["Password Reset"],
)

@app.post("/request", response_model=dict)
async def request_password_reset(
    email: Annotated[EmailStr, Form()],
    background_tasks: BackgroundTasks,
    session: DBSession,
):
    try:
        # Check if email exists in students or clubs
        student = session.exec(
            select(StudentModel).where(StudentModel.email == email)
        ).first()
        club = session.exec(
            select(ClubModel).where(ClubModel.email == email)
        ).first()

        if not student and not club:
            # Return success even if email doesn't exist for security
            return {"message": "If the email exists, a password reset link will be sent"}

        # Create password reset token
        reset_token = PasswordResetModel(
            student_id=student.id if student else None,
            club_id=club.id if club else None,
            expires_at=datetime.now() + timedelta(hours=1)
        )
        session.add(reset_token)
        session.commit()

        # Generate reset link
        frontend_url = os.getenv("FRONTEND_URL", "http://localhost:5173")
        reset_link = f"{frontend_url}/reset-password?token={reset_token.token}"

        # Send email
        background_tasks.add_task(
            send_password_reset_email,
            email,
            reset_link
        )

        return {"message": "If the email exists, a password reset link will be sent"}

    except Exception as e:
        print(f"Password reset request error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while processing your request"
        )

@app.post("/reset", response_model=dict)
async def reset_password(
    token: Annotated[str, Form()],
    new_password: Annotated[str, Form()],
    session: DBSession,
):
    try:
        # Find valid token
        reset_token = session.exec(
            select(PasswordResetModel).where(
                PasswordResetModel.token == token,
                PasswordResetModel.used_at.is_(None),
                PasswordResetModel.expires_at > datetime.now()
            )
        ).first()

        if not reset_token:
            raise HTTPException(
                status_code=400,
                detail="Invalid or expired reset token"
            )

        # Get user
        user = None
        if reset_token.student_id:
            user = session.get(StudentModel, reset_token.student_id)
        elif reset_token.club_id:
            user = session.get(ClubModel, reset_token.club_id)

        if not user:
            raise HTTPException(
                status_code=404,
                detail="User not found"
            )

        # Update password
        user.password = get_password_hash(new_password)
        reset_token.used_at = datetime.now()

        session.add(user)
        session.add(reset_token)
        session.commit()

        return {"message": "Password has been reset successfully"}

    except HTTPException as e:
        raise e
    except Exception as e:
        print(f"Password reset error: {str(e)}")
        raise HTTPException(
            status_code=500,
            detail="An error occurred while resetting your password"
        )
