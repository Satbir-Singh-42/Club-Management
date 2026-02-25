import pytest
import bcrypt
from fastapi import status
from backend.models.student import StudentModel, Branch, Gender
from backend.models.club import ClubModel
from backend.models.admin import AdminModel
from datetime import datetime
from backend.lib.auth import get_password_hash
import io
import os


@pytest.fixture
def student(session):
    password = "testpass123"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    student = StudentModel(
        name="Test Student",
        email="test@student.com",
        password=hashed.decode("utf-8"),
        crn="1234567",
        urn="1234567",
        branch=Branch.CSE,
        gender=Gender.M,
        batch=2020,
        phone="1234567890",
        profile_photo="test-photo.jpg",
        all_details_completed=True,
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


@pytest.fixture
def club(session):
    password = "testpass123"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    club = ClubModel(
        name="Test Club",
        email="test@club.com",
        description="Test Description",
        password=hashed.decode("utf-8"),
        acronym="TC",
        logo="test-logo.png",
    )
    session.add(club)
    session.commit()
    session.refresh(club)
    return club


@pytest.fixture
def admin(session):
    password = "testpass123"
    hashed = get_password_hash(password)
    admin = AdminModel(
        name="Test Admin",
        email="test@admin.com",
        password=hashed,
    )
    session.add(admin)
    session.commit()
    session.refresh(admin)
    return admin


def test_create_student(client, admin):
    # Login as admin
    response = client.post(
        "/auth/token", data={"username": admin.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create storage directory
    os.makedirs("storage/profile_photos", exist_ok=True)

    # Create a dummy profile photo file
    photo_content = io.BytesIO(b"dummy photo content")
    photo_content.name = "photo.png"

    response = client.post(
        "/students/new",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "New Student",
            "email": "new@student.com",
            "password": "testpass123",
            "crn": "2345678",
            "urn": "2345678",
            "branch": Branch.ECE.value,
            "gender": Gender.F.value,
            "batch": 2021,
            "phone": "9876543210",
        },
        files={"profile_photo": ("test-photo.jpg", photo_content, "image/jpeg")},
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "New Student"
    assert data["email"] == "new@student.com"
    assert data["crn"] == "2345678"
    assert data["urn"] == "2345678"
    assert data["branch"] == Branch.ECE.value
    assert data["gender"] == Gender.F.value
    assert data["batch"] == 2021
    assert data["phone"] == "9876543210"
    assert data["all_details_completed"] == True
    assert "profile_photo" in data

    # Clean up file
    if os.path.exists(data["profile_photo"]):
        os.remove(data["profile_photo"])


def test_update_student(client, student):
    # Login as student
    response = client.post(
        "/auth/token", data={"username": student.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create storage directory
    os.makedirs("storage/profile_photos", exist_ok=True)

    # Create a dummy profile photo file
    photo_content = io.BytesIO(b"dummy photo content")
    photo_content.name = "photo.png"

    # Update student
    response = client.patch(
        f"/students/{student.id}",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "Updated Student",
            "crn": "3456789",
            "urn": "3456789",
            "branch": Branch.ME.value,
            "gender": Gender.F.value,
            "batch": 2022,
            "phone": "8765432109",
        },
        files={"profile_photo": ("test-photo.jpg", photo_content, "image/jpeg")},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Student"
    assert data["crn"] == "3456789"
    assert data["urn"] == "3456789"
    assert data["branch"] == Branch.ME.value
    assert data["gender"] == Gender.F.value
    assert data["batch"] == 2022
    assert data["phone"] == "8765432109"
    assert data["all_details_completed"] == True
    assert "profile_photo" in data

    # Clean up file
    if os.path.exists(data["profile_photo"]):
        os.remove(data["profile_photo"])


def test_student_cannot_update_other_student(client, student, session):
    # Create another student
    password = "testpass123"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    other_student = StudentModel(
        name="Other Student",
        email="other@student.com",
        password=hashed.decode("utf-8"),
        crn="4567890",
        urn="4567890",
        branch=Branch.CE,
        gender=Gender.M,
        batch=2023,
        phone="7654321098",
        profile_photo="test-photo.jpg",
        all_details_completed=True,
    )
    session.add(other_student)
    session.commit()

    # Login as other student
    response = client.post(
        "/auth/token", data={"username": other_student.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create storage directory
    os.makedirs("storage/profile_photos", exist_ok=True)

    # Create a dummy profile photo file
    photo_content = io.BytesIO(b"dummy photo content")
    photo_content.name = "photo.png"

    # Try to update student
    response = client.patch(
        f"/students/{student.id}",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "Updated Student",
            "crn": "3456789",
            "urn": "3456789",
            "branch": Branch.ME.value,
            "gender": Gender.F.value,
            "batch": 2022,
            "phone": "8765432109",
        },
        files={"profile_photo": ("test-photo.jpg", photo_content, "image/jpeg")},
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_delete_student(client, student, admin):
    # Login as admin
    response = client.post(
        "/auth/token", data={"username": admin.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Delete student
    response = client.delete(
        f"/students/{student.id}", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify student is soft deleted
    response = client.get(f"/students/{student.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_permanent_delete_student(client, student):
    # Login as student
    response = client.post(
        "/auth/token", data={"username": student.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Delete profile photo if it exists
    if student.profile_photo and os.path.exists(student.profile_photo):
        os.remove(student.profile_photo)

    # Permanent delete student
    response = client.delete(
        f"/students/{student.id}/permanent", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify student is permanently deleted
    response = client.get(f"/students/{student.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND
