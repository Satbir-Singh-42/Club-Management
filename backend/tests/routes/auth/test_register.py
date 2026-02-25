from fastapi.testclient import TestClient
from sqlmodel import Session, select
from datetime import datetime, timedelta
from unittest.mock import patch
from backend.models.verification import VerificationModel
from backend.models.student import StudentModel
from datetime import datetime, timedelta
from unittest.mock import patch
from backend.models.verification import VerificationModel


# First, modify existing registration tests since the response format has changed
def test_register_minimal_successful(client: TestClient, session: Session):
    with patch("backend.routes.register.send_verification_email") as mock_send_email:
        req_data = {
            "email": "test@example.com",
            "password": "password",
        }
        response = client.post("/register", data=req_data)
        assert response.status_code == 201
        res_data = response.json()
        assert "message" in res_data
        assert "student_id" in res_data

        # Verify that send_verification_email was called
        mock_send_email.assert_called_once()

        # Check if verification record was created
        verification = session.exec(
            select(VerificationModel).where(
                VerificationModel.student_id == res_data["student_id"]
            )
        ).first()
        assert verification is not None
        assert len(verification.otp) == 6
        assert verification.expires_at > datetime.now()


# Add new tests for verification functionality


def test_verify_email_successful(client: TestClient, session: Session):
    # First register a student
    with patch("backend.routes.register.send_verification_email") as mock_send_email:
        req_data = {
            "email": "test@example.com",
            "password": "password",
        }
        response = client.post("/register", data=req_data)
        student_id = response.json()["student_id"]

        # Get the verification record
        verification = session.exec(
            select(VerificationModel).where(VerificationModel.student_id == student_id)
        ).first()

        # Verify email
        verify_data = {"student_id": student_id, "otp": verification.otp}
        response = client.post("/register/verify", data=verify_data)
        assert response.status_code == 200
        assert response.json()["message"] == "Email verified successfully"

        # Check if student is marked as verified
        student = session.exec(
            select(StudentModel).where(StudentModel.id == student_id)
        ).first()
        assert student.verified_at is not None


def test_verify_email_invalid_otp(client: TestClient, session: Session):
    # First register a student
    with patch("backend.routes.register.send_verification_email"):
        req_data = {
            "email": "test@example.com",
            "password": "password",
        }
        response = client.post("/register", data=req_data)
        student_id = response.json()["student_id"]

        # Try to verify with wrong OTP
        verify_data = {"student_id": student_id, "otp": "000000"}
        response = client.post("/register/verify", data=verify_data)
        assert response.status_code == 400
        assert "Invalid verification code" in response.json()["detail"][0]["msg"]


def test_verify_email_expired(client: TestClient, session: Session):
    # First register a student
    with patch("backend.routes.register.send_verification_email"):
        req_data = {
            "email": "test@example.com",
            "password": "password",
        }
        response = client.post("/register", data=req_data)
        student_id = response.json()["student_id"]

        # Get and expire the verification record
        verification = session.exec(
            select(VerificationModel).where(VerificationModel.student_id == student_id)
        ).first()
        verification.expires_at = datetime.now() - timedelta(minutes=1)
        session.add(verification)
        session.commit()

        # Try to verify
        verify_data = {"student_id": student_id, "otp": verification.otp}
        response = client.post("/register/verify", data=verify_data)
        assert response.status_code == 400
        assert "expired" in response.json()["detail"][0]["msg"]


def test_verify_max_attempts(client: TestClient, session: Session):
    # First register a student
    with patch("backend.routes.register.send_verification_email"):
        req_data = {
            "email": "test@example.com",
            "password": "password",
        }
        response = client.post("/register", data=req_data)
        student_id = response.json()["student_id"]

        # Try verification multiple times
        verify_data = {"student_id": student_id, "otp": "000000"}

        # Make MAX_ATTEMPTS attempts
        for i in range(VerificationModel.MAX_ATTEMPTS):
            response = client.post("/register/verify", data=verify_data)
            assert response.status_code == 400
            if i < VerificationModel.MAX_ATTEMPTS - 1:
                assert (
                    f"{VerificationModel.MAX_ATTEMPTS - i - 1} attempts remaining"
                    in response.json()["detail"][0]["msg"]
                )

        # One more attempt should give "too many attempts" error
        response = client.post("/register/verify", data=verify_data)
        assert response.status_code == 400
        assert "Too many failed attempts" in response.json()["detail"][0]["msg"]


def test_resend_verification(client: TestClient, session: Session):
    # First register a student
    with patch("backend.routes.register.send_verification_email"):
        req_data = {
            "email": "test@example.com",
            "password": "password",
        }
        response = client.post("/register", data=req_data)
        student_id = response.json()["student_id"]

        # Get initial verification
        old_verification = session.exec(
            select(VerificationModel).where(VerificationModel.student_id == student_id)
        ).first()
        old_otp = old_verification.otp

        # Request new verification code
        with patch(
            "backend.routes.register.send_verification_email"
        ) as mock_send_email:
            response = client.post(
                "/register/resend-verification", data={"student_id": student_id}
            )
            assert response.status_code == 200
            assert "Verification code resent successfully" in response.json()["message"]

            # Verify email was sent
            mock_send_email.assert_called_once()

            # Check if new verification record was created
            new_verification = session.exec(
                select(VerificationModel).where(
                    VerificationModel.student_id == student_id
                )
            ).first()
            assert new_verification.otp != old_otp


def test_register_duplicate_unverified(client: TestClient, session: Session):
    # Register first time
    with patch("backend.routes.register.send_verification_email"):
        req_data = {
            "email": "test@example.com",
            "password": "password",
        }
        response = client.post("/register", data=req_data)
        assert response.status_code == 201

        # Try registering again with same email (should be allowed since first registration is unverified)
        response = client.post("/register", data=req_data)
        assert response.status_code == 201
