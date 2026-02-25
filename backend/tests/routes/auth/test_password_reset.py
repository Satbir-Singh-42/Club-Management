from fastapi.testclient import TestClient
from sqlmodel import Session, select
from datetime import datetime, timedelta
from unittest.mock import patch
from backend.models.password_reset import PasswordResetModel
from backend.models.student import StudentModel
from backend.models.club import ClubModel
from backend.lib.auth import get_password_hash

def test_request_reset_student_successful(client: TestClient, session: Session):
    # Create a student
    student = StudentModel(
        email="student@example.com",
        password=get_password_hash("password")
    )
    session.add(student)
    session.commit()

    with patch("backend.routes.password_reset.send_password_reset_email") as mock_send_email:
        response = client.post("/password-reset/request", data={
            "email": "student@example.com"
        })
        assert response.status_code == 200
        assert response.json()["message"] == "If the email exists, a password reset link will be sent"

        # Verify email was sent
        mock_send_email.assert_called_once()

        # Check if reset token was created
        reset_token = session.exec(
            select(PasswordResetModel).where(
                PasswordResetModel.student_id == student.id
            )
        ).first()
        assert reset_token is not None
        assert reset_token.expires_at > datetime.now()

def test_request_reset_club_successful(client: TestClient, session: Session):
    # Create a club
    club = ClubModel(
        email="club@example.com",
        password=get_password_hash("password"),
        name="Test Club",
        acronym="TST",
        logo="logo.jpg"
    )
    session.add(club)
    session.commit()

    with patch("backend.routes.password_reset.send_password_reset_email") as mock_send_email:
        response = client.post("/password-reset/request", data={
            "email": "club@example.com"
        })
        assert response.status_code == 200
        assert response.json()["message"] == "If the email exists, a password reset link will be sent"

        mock_send_email.assert_called_once()

        reset_token = session.exec(
            select(PasswordResetModel).where(
                PasswordResetModel.club_id == club.id
            )
        ).first()
        assert reset_token is not None

def test_request_reset_nonexistent_email(client: TestClient, session: Session):
    with patch("backend.routes.password_reset.send_password_reset_email") as mock_send_email:
        response = client.post("/password-reset/request", data={
            "email": "nonexistent@example.com"
        })
        assert response.status_code == 200
        assert response.json()["message"] == "If the email exists, a password reset link will be sent"

        # Email should not be sent
        mock_send_email.assert_not_called()

def test_reset_password_successful(client: TestClient, session: Session):
    # Create a student and reset token
    student = StudentModel(
        email="student@example.com",
        password=get_password_hash("oldpassword")
    )
    session.add(student)
    session.commit()

    reset_token = PasswordResetModel(
        student_id=student.id,
        expires_at=datetime.now() + timedelta(hours=1)
    )
    session.add(reset_token)
    session.commit()

    response = client.post("/password-reset/reset", data={
        "token": reset_token.token,
        "new_password": "newpassword"
    })
    assert response.status_code == 200
    assert response.json()["message"] == "Password has been reset successfully"

    # Verify password was changed
    updated_student = session.get(StudentModel, student.id)
    assert updated_student.password != get_password_hash("oldpassword")

    # Verify token was marked as used
    used_token = session.get(PasswordResetModel, reset_token.id)
    assert used_token.used_at is not None

def test_reset_password_expired_token(client: TestClient, session: Session):
    # Create expired token
    student = StudentModel(
        email="student@example.com",
        password=get_password_hash("password")
    )
    session.add(student)
    session.commit()

    reset_token = PasswordResetModel(
        student_id=student.id,
        expires_at=datetime.now() - timedelta(minutes=1)
    )
    session.add(reset_token)
    session.commit()

    response = client.post("/password-reset/reset", data={
        "token": reset_token.token,
        "new_password": "newpassword"
    })
    assert response.status_code == 400
    assert "Invalid or expired reset token" in response.json()["detail"]

def test_reset_password_already_used_token(client: TestClient, session: Session):
    # Create used token
    student = StudentModel(
        email="student@example.com",
        password=get_password_hash("password")
    )
    session.add(student)
    session.commit()

    reset_token = PasswordResetModel(
        student_id=student.id,
        expires_at=datetime.now() + timedelta(hours=1),
        used_at=datetime.now()
    )
    session.add(reset_token)
    session.commit()

    response = client.post("/password-reset/reset", data={
        "token": reset_token.token,
        "new_password": "newpassword"
    })
    assert response.status_code == 400
    assert "Invalid or expired reset token" in response.json()["detail"]

def test_reset_password_invalid_token(client: TestClient, session: Session):
    response = client.post("/password-reset/reset", data={
        "token": "invalid_token",
        "new_password": "newpassword"
    })
    assert response.status_code == 400
    assert "Invalid or expired reset token" in response.json()["detail"]
