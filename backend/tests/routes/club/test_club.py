from datetime import datetime
import pytest
import bcrypt
from fastapi import status
from backend.models.club import ClubModel
from backend.models.student import StudentModel
from backend.models.admin import AdminModel
from backend.lib.auth import get_password_hash
import io
import os


@pytest.fixture
def club(session):
    password = "testpass123"
    hashed = get_password_hash(password)
    club = ClubModel(
        name="Test Club",
        email="test@club.com",
        description="Test Description",
        password=hashed,
        acronym="TC",
        logo="test-logo.png",
        faculty_advisor_name="Test Advisor",
        faculty_advisor_contact="advisor@test.com",
        convenor_name="Test Convenor",
        convenor_contact="convenor@test.com",
        highlights="Test Highlights",
        featured_image="test-featured.jpg",
        website="https://test.com",
        all_details_completed=True,
    )
    session.add(club)
    session.commit()
    session.refresh(club)
    return club


@pytest.fixture
def student(session):
    password = "testpass123"
    hashed = get_password_hash(password)
    student = StudentModel(
        name="Test Student",
        email="test@student.com",
        password=hashed,
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


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


def test_create_club(client, admin):
    # Login as admin
    response = client.post(
        "/auth/token", data={"username": admin.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create dummy image files
    logo_content = io.BytesIO(b"dummy logo content")
    logo_content.name = "logo.png"
    featured_content = io.BytesIO(b"dummy featured content")
    featured_content.name = "featured.png"

    response = client.post(
        "/clubs/new",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "New Club",
            "email": "new@club.com",
            "description": "New Description",
            "password": "testpass123",
            "acronym": "NC",
            "faculty_advisor_name": "New Advisor",
            "faculty_advisor_contact": "new.advisor@test.com",
            "convenor_name": "New Convenor",
            "convenor_contact": "new.convenor@test.com",
            "highlights": "New Highlights",
            "website": "https://newclub.com",
            "tagline": "New Tagline",
        },
        files={
            "logo": ("test-logo.jpg", logo_content, "image/jpeg"),
            "featured_image": ("test-featured.jpg", featured_content, "image/jpeg"),
        },
    )

    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["name"] == "New Club"
    assert data["email"] == "new@club.com"
    assert data["description"] == "New Description"
    assert data["acronym"] == "NC"
    assert data["faculty_advisor_name"] == "New Advisor"
    assert data["faculty_advisor_contact"] == "new.advisor@test.com"
    assert data["convenor_name"] == "New Convenor"
    assert data["convenor_contact"] == "new.convenor@test.com"
    assert data["highlights"] == "New Highlights"
    assert data["website"] == "https://newclub.com"
    assert data["tagline"] == "New Tagline"
    assert data["all_details_completed"] == True
    assert "logo" in data
    assert "featured_image" in data

    # Clean up files
    if os.path.exists(data["logo"]):
        os.remove(data["logo"])
    if os.path.exists(data["featured_image"]):
        os.remove(data["featured_image"])


def test_admin_create_club(client, admin):
    # Login as admin
    response = client.post(
        "/auth/token",
        data={"username": admin.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create a dummy logo file
    logo_content = io.BytesIO(b"dummy logo content")
    logo_content.name = "test-logo.png"

    club_data = {
        "name": "New Club",
        "email": "new@club.com",
        "password": "newpass123",
        "acronym": "NC",
        "description": "New Description",
        "tagline": "New Tagline",
        "instagram_url": "https://instagram.com/newclub",
        "venue": "Test Venue",
    }
    response = client.post(
        "/clubs/new",
        headers={"Authorization": f"Bearer {token}"},
        data=club_data,
        files={"logo": ("test-logo.png", logo_content, "image/png")},
    )
    assert response.status_code == status.HTTP_201_CREATED
    data = response.json()
    assert data["email"] == club_data["email"]
    assert data["name"] == club_data["name"]
    assert data["acronym"] == club_data["acronym"]


def test_get_club(client, club):
    response = client.get(f"/clubs/{club.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == club.name
    assert data["email"] == club.email
    assert data["acronym"] == club.acronym


def test_get_nonexistent_club(client):
    response = client.get("/clubs/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def isClub(data):
    assert "id" in data
    assert "name" in data
    assert "email" in data
    assert "acronym" in data
    assert "description" in data
    assert "logo" in data
    assert "tagline" in data


@pytest.fixture
def clubs(session):
    clubs = [
        ClubModel(
            name="Club Alpha",
            email="alpha@club.com",
            description="Description Alpha",
            password=bcrypt.hashpw(
                "testpass123".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
            acronym="CA",
            logo="logo-alpha.jpg",
        ),
        ClubModel(
            name="Club Beta",
            email="beta@club.com",
            description="Description Beta",
            password=bcrypt.hashpw(
                "testpass123".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
            acronym="CB",
            logo="logo-beta.jpg",
        ),
        ClubModel(
            name="Club Gamma",
            email="gamma@club.com",
            description="Description Gamma",
            password=bcrypt.hashpw(
                "testpass123".encode("utf-8"), bcrypt.gensalt()
            ).decode("utf-8"),
            acronym="CG",
            logo="logo-gamma.jpg",
        ),
    ]
    session.add_all(clubs)
    session.commit()
    return clubs


def test_get_clubs(client, clubs, admin):
    # Login as admin
    response = client.post(
        "/auth/token",
        data={"username": admin.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Test without filters
    response = client.get(
        "/clubs",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == len(clubs)

    # Test with filters
    response = client.get(
        "/clubs?name=Club Alpha",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["name"] == "Club Alpha"

    response = client.get(
        "/clubs?acronym=CB",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1
    assert data[0]["acronym"] == "CB"

    # Test sorting
    response = client.get(
        "/clubs?sort_by=name",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]["name"] == "Club Alpha"
    assert data[-1]["name"] == "Club Gamma"

    response = client.get(
        "/clubs?sort_by=-name",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]["name"] == "Club Gamma"
    assert data[-1]["name"] == "Club Alpha"

    # Test pagination
    response = client.get(
        "/clubs?skip=0&limit=2",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2

    response = client.get(
        "/clubs?skip=2&limit=2",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 1


def test_club_update_own_profile(client, club):
    # Login as club
    response = client.post(
        "/auth/token",
        data={"username": club.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create a dummy logo file
    logo_content = io.BytesIO(b"dummy logo content")
    logo_content.name = "test-logo.png"

    # Update profile
    update_data = {
        "name": "Updated Club",
        "tagline": "Updated Tagline",
        "venue": "Updated Venue",
    }
    response = client.patch(
        f"/clubs/{club.id}",
        headers={"Authorization": f"Bearer {token}"},
        data=update_data,
        files={"logo": ("test-logo.png", logo_content, "image/png")},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["tagline"] == update_data["tagline"]


def test_club_cannot_update_other_profile(client, club, session):
    # Create another club
    other_club = ClubModel(
        name="Other Club",
        email="other@club.com",
        password=get_password_hash("testpass123"),
        acronym="OC",
        logo="other-logo.png",
    )
    session.add(other_club)
    session.commit()

    # Login as first club
    response = client.post(
        "/auth/token",
        data={"username": club.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Try to update other club's profile
    update_data = {
        "name": "Updated Club",
        "tagline": "Updated Tagline",
    }
    response = client.patch(
        f"/clubs/{other_club.id}",
        headers={"Authorization": f"Bearer {token}"},
        data=update_data,
    )
    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_admin_update_club_profile(client, admin, club):
    # Login as admin
    response = client.post(
        "/auth/token",
        data={"username": admin.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create a dummy logo file
    logo_content = io.BytesIO(b"dummy logo content")
    logo_content.name = "test-logo.png"

    # Update club profile
    update_data = {
        "name": "Updated By Admin",
        "tagline": "Updated Tagline",
        "venue": "Updated Venue",
    }
    response = client.patch(
        f"/clubs/{club.id}",
        headers={"Authorization": f"Bearer {token}"},
        data=update_data,
        files={"logo": ("test-logo.png", logo_content, "image/png")},
    )
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == update_data["name"]
    assert data["tagline"] == update_data["tagline"]


def test_admin_delete_club(client, admin, club):
    # Login as admin
    response = client.post(
        "/auth/token",
        data={"username": admin.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Delete club
    response = client.delete(
        f"/clubs/{club.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify club is soft deleted
    response = client.get(f"/clubs/{club.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_club_permanent_delete_own_profile(client, club):
    # Login as club
    response = client.post(
        "/auth/token",
        data={"username": club.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Permanently delete own profile
    response = client.delete(
        f"/clubs/{club.id}/permanent",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify club is permanently deleted
    response = client.get(f"/clubs/{club.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_duplicate_club_creation(client, admin):
    # Login as admin
    response = client.post(
        "/auth/token",
        data={"username": admin.email, "password": "testpass123"},
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create first club
    logo_content = io.BytesIO(b"dummy logo content")
    club_data = {
        "email": "test@club.com",
        "name": "Test Club",
        "acronym": "TC",
        "password": "testpass123",
        "description": "Test Description",
        "venue": "Test Venue",
    }
    response = client.post(
        "/clubs/new",
        data=club_data,
        files={"logo": ("test-logo.png", logo_content, "image/png")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_201_CREATED

    # Try to create duplicate club
    logo_content = io.BytesIO(b"dummy logo content")
    response = client.post(
        "/clubs/new",
        data=club_data,  # Use same data to ensure duplicate
        files={"logo": ("test-logo.png", logo_content, "image/png")},
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == status.HTTP_400_BAD_REQUEST


def test_update_club(client, club):
    # Login as club
    response = client.post(
        "/auth/token", data={"username": club.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create dummy image files
    logo_content = io.BytesIO(b"dummy logo content")
    logo_content.name = "logo.png"
    featured_content = io.BytesIO(b"dummy featured content")
    featured_content.name = "featured.png"

    # Update club
    response = client.patch(
        f"/clubs/{club.id}",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "Updated Club",
            "description": "Updated Description",
            "faculty_advisor_name": "Updated Advisor",
            "faculty_advisor_contact": "updated.advisor@test.com",
            "convenor_name": "Updated Convenor",
            "convenor_contact": "updated.convenor@test.com",
            "highlights": "Updated Highlights",
            "website": "https://updated.com",
            "tagline": "Updated Tagline",
        },
        files={
            "logo": ("test-logo.jpg", logo_content, "image/jpeg"),
            "featured_image": ("test-featured.jpg", featured_content, "image/jpeg"),
        },
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Club"
    assert data["description"] == "Updated Description"
    assert data["faculty_advisor_name"] == "Updated Advisor"
    assert data["faculty_advisor_contact"] == "updated.advisor@test.com"
    assert data["convenor_name"] == "Updated Convenor"
    assert data["convenor_contact"] == "updated.convenor@test.com"
    assert data["highlights"] == "Updated Highlights"
    assert data["website"] == "https://updated.com"
    assert data["tagline"] == "Updated Tagline"
    assert data["all_details_completed"] == True

    # Clean up files
    if os.path.exists(data["logo"]):
        os.remove(data["logo"])
    if os.path.exists(data["featured_image"]):
        os.remove(data["featured_image"])
