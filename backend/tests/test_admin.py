import pytest
import bcrypt
from fastapi import status
from backend.models.admin import AdminModel
from backend.models.student import StudentModel
from backend.lib.auth import get_password_hash


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


@pytest.fixture
def student(session):
    password = "testpass123"
    hashed = get_password_hash(password)
    student = StudentModel(
        name="Test Student",
        email="test@student.com",
        password=hashed,
        crn="1234567",
        urn="7654321",
        branch="CSE",
        gender="M",
        batch=2024,
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


def test_admin_create_admin(client, admin):
    # Login as admin
    response = client.post(
        "/auth/token",
        data={"username": admin.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create new admin
    new_admin_data = {
        "email": "new@admin.com",
        "name": "New Admin",
        "password": "newpass123",
    }
    response = client.post(
        "/admin/",
        headers={"Authorization": f"Bearer {token}"},
        params=new_admin_data,
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == new_admin_data["email"]
    assert data["name"] == new_admin_data["name"]


def test_non_admin_cannot_create_admin(client, student):
    # Login as student
    response = client.post(
        "/auth/token",
        data={"username": student.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Try to create admin
    new_admin_data = {
        "email": "new@admin.com",
        "name": "New Admin",
        "password": "newpass123",
    }
    response = client.post(
        "/admin/",
        headers={"Authorization": f"Bearer {token}"},
        params=new_admin_data,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_get_profile(client, admin):
    # Login as admin
    response = client.post(
        "/auth/token",
        data={"username": admin.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Get admin profile
    response = client.get(
        "/admin/me",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["email"] == admin.email
    assert data["name"] == admin.name 