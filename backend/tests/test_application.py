from fastapi.testclient import TestClient
from sqlmodel import Session, SQLModel, create_engine
from sqlmodel.pool import StaticPool
import pytest

from ..main import app
from ..database import get_session
from ..models.event import EventModel
from ..models.registration import RegistrationModel
from ..models.registration_field import RegistrationFieldModel, FieldType
from ..models.student import StudentModel
from ..models.application import ApplicationModel
from ..models.application_field import ApplicationFieldModel
from ..models.club import ClubModel
from ..models.admin import AdminModel
from ..lib.auth import get_password_hash


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


@pytest.fixture(name="test_data")
def test_data_fixture(session: Session):
    # Create test club
    club = ClubModel(
        name="Test Club",
        email="test@club.com",
        description="Test Description",
        password=get_password_hash("testpass123"),
        acronym="TC",
        logo="test-logo.png",
    )
    session.add(club)
    session.commit()
    session.refresh(club)

    # Create test event
    event = EventModel(
        name="Test Event",
        description="Test Description",
        venue="Test Venue",
        club_id=club.id,
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    
    # Create test registration
    registration = RegistrationModel(open=True)
    event.registration = registration
    session.add(registration)
    session.commit()
    session.refresh(registration)
    
    # Create test registration fields with different types
    fields = []
    for field_type in [FieldType.text, FieldType.email, FieldType.number]:
        field = RegistrationFieldModel(
            registration_id=registration.id,
            name=f"Test {field_type.value} Field",
            type=field_type,
            required=True,
        )
        fields.append(field)
        session.add(field)
    session.commit()
    for field in fields:
        session.refresh(field)
    
    # Create test student
    student = StudentModel(
        name="Test Student",
        email="test@example.com",
        password=get_password_hash("testpass123"),
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    
    return {
        "club": club,
        "event": event,
        "registration": registration,
        "fields": fields,
        "student": student,
    }


def test_create_application(client: TestClient, test_data: dict):
    # Login as student
    response = client.post(
        "/auth/token",
        data={"username": test_data["student"].email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    application_data = {
        "student_id": test_data["student"].id,
        "registration_id": test_data["registration"].id,
    }
    
    response = client.post(
        "/applications/",
        headers={"Authorization": f"Bearer {token}"},
        json=application_data,
    )
    assert response.status_code == 200
    
    data = response.json()
    assert data["student_id"] == application_data["student_id"]
    assert data["registration_id"] == application_data["registration_id"]
    
    # Try to create duplicate application
    response = client.post(
        "/applications/",
        headers={"Authorization": f"Bearer {token}"},
        json=application_data,
    )
    assert response.status_code == 400


def test_get_application(client: TestClient, session: Session, test_data: dict):
    # Login as student
    response = client.post(
        "/auth/token",
        data={"username": test_data["student"].email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create test application
    application = ApplicationModel(
        student_id=test_data["student"].id,
        registration_id=test_data["registration"].id,
    )
    session.add(application)
    session.commit()
    session.refresh(application)
    
    response = client.get(
        f"/applications/{application.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    
    data = response.json()
    assert data["id"] == application.id
    assert data["student_id"] == test_data["student"].id
    assert data["registration_id"] == test_data["registration"].id


def test_get_applications_by_registration(
    client: TestClient, session: Session, test_data: dict
):
    # Login as club
    response = client.post(
        "/auth/token",
        data={"username": test_data["club"].email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create test applications
    application1 = ApplicationModel(
        student_id=test_data["student"].id,
        registration_id=test_data["registration"].id,
    )
    session.add(application1)
    session.commit()
    session.refresh(application1)
    
    response = client.get(
        f"/applications/registration/{test_data['registration'].id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == 1
    assert data[0]["id"] == application1.id


def test_create_application_field(client: TestClient, session: Session, test_data: dict):
    # Login as student
    response = client.post(
        "/auth/token",
        data={"username": test_data["student"].email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create test application
    application = ApplicationModel(
        student_id=test_data["student"].id,
        registration_id=test_data["registration"].id,
    )
    session.add(application)
    session.commit()
    session.refresh(application)
    
    # Test creating fields with different types
    test_values = {
        FieldType.text: "Test text value",
        FieldType.email: "test@example.com",
        FieldType.number: "42",
    }
    
    for field in test_data["fields"]:
        field_data = {
            "registration_field_id": field.id,
            "value": test_values[field.type],
        }
        
        response = client.post(
            f"/applications/{application.id}/fields",
            headers={"Authorization": f"Bearer {token}"},
            params=field_data,
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["value"] == field_data["value"]
        assert data["registration_field_id"] == field_data["registration_field_id"]
        
        # Try to create duplicate field
        response = client.post(
            f"/applications/{application.id}/fields",
            headers={"Authorization": f"Bearer {token}"},
            params=field_data,
        )
        assert response.status_code == 400


def test_get_application_fields(client: TestClient, session: Session, test_data: dict):
    # Login as student
    response = client.post(
        "/auth/token",
        data={"username": test_data["student"].email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create test application and fields
    application = ApplicationModel(
        student_id=test_data["student"].id,
        registration_id=test_data["registration"].id,
    )
    session.add(application)
    session.commit()
    session.refresh(application)
    
    test_values = {
        FieldType.text: "Test text value",
        FieldType.email: "test@example.com",
        FieldType.number: "42",
    }
    
    application_fields = []
    for field in test_data["fields"]:
        application_field = ApplicationFieldModel(
            application_id=application.id,
            registration_field_id=field.id,
            value=test_values[field.type],
        )
        application_fields.append(application_field)
        session.add(application_field)
    session.commit()
    for field in application_fields:
        session.refresh(field)
    
    response = client.get(
        f"/applications/{application.id}/fields",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    
    data = response.json()
    assert len(data) == len(test_data["fields"])
    for i, field in enumerate(test_data["fields"]):
        assert data[i]["value"] == test_values[field.type]
        assert data[i]["registration_field_id"] == field.id


def test_update_application_field(client: TestClient, session: Session, test_data: dict):
    # Login as student
    response = client.post(
        "/auth/token",
        data={"username": test_data["student"].email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create test application and fields
    application = ApplicationModel(
        student_id=test_data["student"].id,
        registration_id=test_data["registration"].id,
    )
    session.add(application)
    session.commit()
    session.refresh(application)
    
    test_values = {
        FieldType.text: "Test text value",
        FieldType.email: "test@example.com",
        FieldType.number: "42",
    }
    
    updated_values = {
        FieldType.text: "Updated text value",
        FieldType.email: "updated@example.com",
        FieldType.number: "123",
    }
    
    application_fields = []
    for field in test_data["fields"]:
        application_field = ApplicationFieldModel(
            application_id=application.id,
            registration_field_id=field.id,
            value=test_values[field.type],
        )
        application_fields.append(application_field)
        session.add(application_field)
    session.commit()
    for field in application_fields:
        session.refresh(field)
    
    # Test updating fields with different types
    for i, field in enumerate(test_data["fields"]):
        update_data = {"value": updated_values[field.type]}
        
        response = client.put(
            f"/applications/{application.id}/fields/{application_fields[i].id}",
            headers={"Authorization": f"Bearer {token}"},
            params=update_data,
        )
        assert response.status_code == 200
        
        data = response.json()
        assert data["value"] == update_data["value"]


def test_delete_application_field(client: TestClient, session: Session, test_data: dict):
    # Login as student
    response = client.post(
        "/auth/token",
        data={"username": test_data["student"].email, "password": "testpass123"},
    )
    assert response.status_code == 200
    token = response.json()["access_token"]

    # Create test application and field
    application = ApplicationModel(
        student_id=test_data["student"].id,
        registration_id=test_data["registration"].id,
    )
    session.add(application)
    session.commit()
    session.refresh(application)
    
    application_field = ApplicationFieldModel(
        application_id=application.id,
        registration_field_id=test_data["fields"][0].id,  # Use first field from the list
        value="Test Value",
    )
    session.add(application_field)
    session.commit()
    session.refresh(application_field)
    
    response = client.delete(
        f"/applications/{application.id}/fields/{application_field.id}",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 204
    
    # Verify field is deleted
    response = client.get(
        f"/applications/{application.id}/fields",
        headers={"Authorization": f"Bearer {token}"},
    )
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 0 