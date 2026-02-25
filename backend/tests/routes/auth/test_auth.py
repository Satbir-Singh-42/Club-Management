import pytest
from fastapi.testclient import TestClient
from backend.models.club import ClubModel
from backend.lib.auth import get_password_hash
from backend.main import app

client = TestClient(app)


# Club credentials fixture
@pytest.fixture
def club_credentials():
    return {"email": "causmicclib@gndec.ac.in", "password": "causmicclub"}


# Student credentials fixture
@pytest.fixture
def student_credentials():
    return {
        "email": "user@example.com",
        "password": "stringst",
    }


# Helper function to register a student
def register_student(client, student_credentials):
    response = client.post("/register", data=student_credentials)
    assert response.status_code == 201, f"Unexpected response: {response.text}"


# Helper function to manually create club
def create_club(session, club_credentials):
    club = ClubModel(
        email=club_credentials["email"],
        password=get_password_hash(club_credentials["password"]),
        name="CAUSMIC Club",
        description="CAUSMIC Club is a club for CAUSMIC students.",
        acronym="CSMC",
        tagline="CAUSMIC Club",
        logo="https://example.com/logo.png",
    )
    session.add(club)
    session.commit()


# Helper function to get auth token
def get_auth_token(client, username, password):
    response = client.post(
        "/auth/token",
        data={"username": username, "password": password, "grant_type": "password"},
    )
    assert response.status_code == 200, f"Unexpected response: {response.text}"
    return response.json()["access_token"]


# Test for student authentication
def test_student_authentication(client, student_credentials):
    # Register a student
    register_student(client, student_credentials)

    # Log in as student
    token = get_auth_token(
        client, student_credentials["email"], student_credentials["password"]
    )

    # Access the /me endpoint
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["email"] == student_credentials["email"]
    assert res_data["urn"] is None


# Test for club authentication
def test_club_authentication(client, session, club_credentials):
    # Create a club
    create_club(session, club_credentials)
    # Log in as club
    token = get_auth_token(
        client, club_credentials["email"], club_credentials["password"]
    )

    # Access the /me endpoint
    response = client.get("/auth/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    res_data = response.json()
    assert res_data["email"] == club_credentials["email"]
    assert res_data["acronym"] is not None


# Test for failed login
def test_login_failure(client):
    response = client.post(
        "/auth/token", data={"username": "wrong_user", "password": "wrong_password"}
    )
    assert response.status_code == 401
    assert response.json()["detail"] == "Incorrect username or password"


# Test for unauthorized access to /me
def test_me_unauthorized(client):
    response = client.get("/auth/me")
    assert response.status_code == 401
    assert response.json()["detail"] == "Not authenticated"
