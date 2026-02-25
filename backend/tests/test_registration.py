from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import pytest

from ..main import app
from ..database import get_session
from ..models.event import EventModel
from ..models.registration import RegistrationModel
from ..models.registration_field import RegistrationFieldModel, FieldType
from ..models.club import ClubModel
from ..lib.auth import get_password_hash
from ..models.student import StudentModel

# Create a test database
@pytest.fixture(name="session")
def session_fixture():
    engine = create_engine(
        "sqlite://",
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
    SQLModel.metadata.create_all(engine)
    with Session(engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session):
    def get_session_override():
        return session

    app.dependency_overrides[get_session] = get_session_override
    client = TestClient(app)
    yield client
    app.dependency_overrides.clear()


@pytest.fixture(name="club")
def club_fixture(session):
    password = "testpass123"
    hashed = get_password_hash(password)
    club = ClubModel(
        name="Test Club",
        email="test@club.com",
        description="Test Description",
        password=hashed,
        acronym="TC",
        logo="test-logo.png",
    )
    session.add(club)
    session.commit()
    session.refresh(club)
    return club


def test_create_registration(client: TestClient, session: Session, club: ClubModel):
    # Create a test event first
    event = EventModel(
        name="Test Event",
        description="Test Description",
        venue="Test Venue",
        club_id=club.id,
    )
    session.add(event)
    session.commit()
    
    response = client.post(f"/registrations/?event_id={event.id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["open"] is True
    
    # Try to create another registration for the same event
    response = client.post(f"/registrations/?event_id={event.id}")
    assert response.status_code == 400


def test_get_registration(client: TestClient, session: Session, club: ClubModel):
    # Create a test event and registration
    event = EventModel(
        name="Test Event",
        description="Test Description",
        venue="Test Venue",
        club_id=club.id,
    )
    registration = RegistrationModel(open=True)
    event.registration = registration
    session.add(event)
    session.commit()
    
    response = client.get(f"/registrations/{registration.id}")
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == registration.id
    assert data["open"] is True
    
    # Test non-existent registration
    response = client.get("/registrations/999")
    assert response.status_code == 404


def test_update_registration(client: TestClient, session: Session, club: ClubModel):
    # Login as club
    response = client.post(
        "/auth/token",
        data={"username": club.email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create a test event and registration
    event = EventModel(
        name="Test Event",
        description="Test Description",
        venue="Test Venue",
        club_id=club.id,
    )
    registration = RegistrationModel(open=True)
    event.registration = registration
    session.add(event)
    session.commit()
    session.refresh(event)
    session.refresh(registration)
    
    response = client.put(
        f"/registrations/{registration.id}",
        headers={"Authorization": f"Bearer {token}"},
        params={"open": False},
    )
    assert response.status_code == 200
    
    data = response.json()
    assert data["open"] is False


def test_create_registration_field(client: TestClient, session: Session, club: ClubModel):
    # Login as club
    response = client.post(
        "/auth/token",
        data={"username": club.email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create a test event and registration
    event = EventModel(
        name="Test Event",
        description="Test Description",
        venue="Test Venue",
        club_id=club.id,
    )
    registration = RegistrationModel(open=True)
    event.registration = registration
    session.add(event)
    session.commit()
    session.refresh(event)
    session.refresh(registration)
    
    # Test creating fields with different types
    field_types = [
        FieldType.text,
        FieldType.number,
        FieldType.email,
        FieldType.phone,
        FieldType.date,
        FieldType.time,
        FieldType.datetime,
        FieldType.url,
        FieldType.file,
    ]
    
    for field_type in field_types:
        field_data = {
            "name": f"Test {field_type.value} Field",
            "description": f"Test Description for {field_type.value}",
            "type": field_type.value,
            "required": True,
        }
        
        response = client.post(
            f"/registrations/{registration.id}/fields",
            headers={"Authorization": f"Bearer {token}"},
            params=field_data,
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == field_data["name"]
        assert data["type"] == field_data["type"]
        assert data["required"] == field_data["required"]


def test_get_registration_fields(client: TestClient, session: Session, club: ClubModel):
    # Login as club
    response = client.post(
        "/auth/token",
        data={"username": club.email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create a test event and registration with fields
    event = EventModel(
        name="Test Event",
        description="Test Description",
        venue="Test Venue",
        club_id=club.id,
    )
    registration = RegistrationModel(open=True)
    event.registration = registration
    session.add(event)
    session.commit()
    session.refresh(registration)

    # Create fields with different types
    fields = [
        RegistrationFieldModel(
            registration_id=registration.id,
            name=f"Test {field_type.value} Field",
            type=field_type,
            required=True,
        )
        for field_type in [FieldType.text, FieldType.email, FieldType.number]
    ]
    session.add_all(fields)
    session.commit()
    
    response = client.get(
        f"/registrations/{registration.id}/fields",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 3
    for i, field_type in enumerate([FieldType.text, FieldType.email, FieldType.number]):
        assert data[i]["name"] == f"Test {field_type.value} Field"
        assert data[i]["type"] == field_type.value
        assert data[i]["required"] is True


def test_update_registration_field(client: TestClient, session: Session, club: ClubModel):
    # Login as club
    response = client.post(
        "/auth/token",
        data={"username": club.email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create a test event and registration with a field
    event = EventModel(
        name="Test Event",
        description="Test Description",
        venue="Test Venue",
        club_id=club.id,
    )
    registration = RegistrationModel(open=True)
    event.registration = registration
    session.add(event)
    session.commit()
    session.refresh(event)
    session.refresh(registration)

    field = RegistrationFieldModel(
        registration_id=registration.id,
        name="Test Field",
        type=FieldType.text,
        required=True,
    )
    session.add(field)
    session.commit()
    session.refresh(field)

    # Test updating to different field types
    for field_type in [FieldType.email, FieldType.number, FieldType.phone]:
        update_data = {
            "name": f"Updated {field_type.value} Field",
            "type": field_type.value,
            "required": False,
        }
        
        response = client.put(
            f"/registrations/{registration.id}/fields/{field.id}",
            headers={"Authorization": f"Bearer {token}"},
            params=update_data,
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["name"] == update_data["name"]
        assert data["type"] == update_data["type"]
        assert data["required"] == update_data["required"]


def test_delete_registration_field(client: TestClient, session: Session, club: ClubModel):
    # Login as club
    response = client.post(
        "/auth/token",
        data={"username": club.email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create a test event and registration with a field
    event = EventModel(
        name="Test Event",
        description="Test Description",
        venue="Test Venue",
        club_id=club.id,
    )
    registration = RegistrationModel(open=True)
    event.registration = registration
    session.add(event)
    session.commit()
    session.refresh(event)
    session.refresh(registration)

    field = RegistrationFieldModel(
        registration_id=registration.id,
        name="Test Field",
        type=FieldType.text,
        required=True,
    )
    session.add(field)
    session.commit()
    session.refresh(field)
    
    response = client.delete(
        f"/registrations/{registration.id}/fields/{field.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204
    
    # Verify field is deleted
    response = client.get(
        f"/registrations/{registration.id}/fields",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0 