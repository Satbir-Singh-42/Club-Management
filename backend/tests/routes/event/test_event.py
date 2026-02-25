from datetime import datetime, timedelta
import pytest
import bcrypt
from fastapi import status
from backend.models.event import EventModel
from backend.models.club import ClubModel
from backend.models.student import StudentModel
import io
import os


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
def student(session):
    password = "testpass123"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    student = StudentModel(
        name="Test Student", email="test@student.com", password=hashed.decode("utf-8")
    )
    session.add(student)
    session.commit()
    session.refresh(student)
    return student


@pytest.fixture
def event(session, club):
    dt = datetime.now()
    event = EventModel(
        name="Test Event",
        description="Test",
        rules="Test Rules",
        date=dt.date(),
        time=dt.time(),
        venue="Test Venue",
        poster="test-banner.jpg",
        team_size=1,
        club_id=club.id,
    )
    session.add(event)
    session.commit()
    session.refresh(event)
    return event


def test_create_event(client, club):
    # Login as club
    response = client.post(
        "/auth/token", data={"username": club.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create event
    dt = datetime.now() + timedelta(days=1)
    application_open = datetime.now()
    application_close = datetime.now() + timedelta(days=7)

    # Create a dummy image file
    image_content = io.BytesIO(b"dummy image content")
    image_content.name = "poster.png"

    response = client.post(
        "/events/new",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "New Event",
            "description": "New Description",
            "rules": "Test Rules",
            "date": dt.date().isoformat(),
            "time": dt.time().isoformat(),
            "venue": "New Location",
            "team_size": 1,
            "is_featured": False,
            "event_type": "TECHNICAL",
            "tagline": "Test Tagline",
            "application_open": application_open.isoformat(),
            "application_close": application_close.isoformat(),
        },
        files={"poster": ("test-poster.jpg", image_content, "image/jpeg")},
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "New Event"
    assert data["description"] == "New Description"
    assert data["venue"] == "New Location"
    assert data["club_id"] == club.id
    assert data["is_featured"] == False
    assert data["event_type"] == "TECHNICAL"
    assert data["tagline"] == "Test Tagline"
    assert data["application_open"] == application_open.isoformat()
    assert data["application_close"] == application_close.isoformat()
    assert "poster" in data

    # Verify the poster URL is valid
    poster_url = data["poster"]
    print(poster_url)
    response = client.get(poster_url)
    assert response.status_code == status.HTTP_200_OK
    assert response.headers["content-type"].startswith("image/")

    # Remove the poster file
    os.remove(poster_url)


def test_student_cannot_create_event(client, student):
    # Login as student
    response = client.post(
        "/auth/token", data={"username": student.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Try to create event
    dt = datetime.now() + timedelta(days=1)

    # Create a dummy image file
    image_content = io.BytesIO(b"dummy image content")
    image_content.name = "storage/posters/6.png"

    response = client.post(
        "/events/new",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "name": "New Event",
            "description": "New Description",
            "venue": "New Location",
            "date": dt.date().isoformat(),
            "time": dt.time().isoformat(),
            "rules": "Test Rules",
            "team_size": 1,
        },
        files={"poster": ("test-poster.jpg", image_content, "image/jpeg")},
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_get_event(client, event):
    response = client.get(f"/events/{event.id}")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == event.name
    assert data["description"] == event.description
    assert data["venue"] == event.venue


def test_get_nonexistent_event(client):
    response = client.get("/events/999")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def isEvent(data):
    assert "id" in data
    assert "name" in data
    assert "description" in data
    assert "rules" in data
    assert "date" in data
    assert "time" in data
    assert "venue" in data
    assert "team_size" in data
    assert "registration_url" in data
    assert "club_id" in data
    assert "is_featured" in data
    assert "event_type" in data
    assert "tagline" in data
    assert "application_open" in data
    assert "application_close" in data


@pytest.fixture
def events(session, club):
    dt = datetime.now()
    events = [
        EventModel(
            name="Event Alpha",
            description="Description Alpha",
            rules="Rules Alpha",
            date=dt.date(),
            time=dt.time(),
            venue="Venue X",
            poster="poster-alpha.jpg",
            team_size=1,
            club_id=club.id,
            is_featured=True,
            event_type="TECHNICAL",
            tagline="Tagline Alpha",
            application_open=dt,
            application_close=dt + timedelta(days=7),
        ),
        EventModel(
            name="Event Beta",
            description="Description Beta",
            rules="Rules Beta",
            date=(dt + timedelta(days=1)).date(),
            time=(dt + timedelta(hours=1)).time(),
            venue="Venue Y",
            poster="poster-beta.jpg",
            team_size=2,
            club_id=club.id,
            is_featured=False,
            event_type="CULTURAL",
            tagline="Tagline Beta",
            application_open=dt + timedelta(days=1),
            application_close=dt + timedelta(days=8),
        ),
        EventModel(
            name="Event Gamma",
            description="Description Gamma",
            rules="Rules Gamma",
            date=(dt + timedelta(days=2)).date(),
            time=(dt + timedelta(hours=2)).time(),
            venue="Venue X",
            poster="poster-gamma.jpg",
            team_size=3,
            club_id=club.id,
            is_featured=True,
            event_type="SPORTS",
            tagline="Tagline Gamma",
            application_open=dt + timedelta(days=2),
            application_close=dt + timedelta(days=9),
        ),
        EventModel(
            name="Event Delta",
            description="Description Delta",
            rules="Rules Delta",
            date=(dt + timedelta(days=3)).date(),
            time=(dt + timedelta(hours=3)).time(),
            venue="Venue Z",
            poster="poster-delta.jpg",
            team_size=4,
            club_id=club.id,
            is_featured=False,
            event_type="WORKSHOP",
            tagline="Tagline Delta",
            application_open=dt + timedelta(days=3),
            application_close=dt + timedelta(days=10),
        ),
        EventModel(
            name="Event Alpha",
            description="Description Epsilon",
            rules="Rules Epsilon",
            date=(dt + timedelta(days=4)).date(),
            time=(dt + timedelta(hours=4)).time(),
            venue="Venue Y",
            poster="poster-epsilon.jpg",
            team_size=5,
            club_id=club.id,
            is_featured=True,
            event_type="SEMINAR",
            tagline="Tagline Epsilon",
            application_open=dt + timedelta(days=4),
            application_close=dt + timedelta(days=11),
        ),
    ]
    session.add_all(events)
    session.commit()
    return events


def test_get_events(client, events, club):
    # Test without filters
    response = client.get("/events")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == len(events)

    # Test with filters
    response = client.get("/events?name=Event Alpha")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2  # We have two events with name "Event Alpha"
    assert all(event["name"] == "Event Alpha" for event in data)

    response = client.get("/events?venue=Venue X")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2  # We have two events in Venue X
    assert all(event["venue"] == "Venue X" for event in data)

    # Test sorting
    response = client.get("/events?sort_by=name")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]["name"] < data[-1]["name"]

    response = client.get("/events?sort_by=-name")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]["name"] > data[-1]["name"]

    # Test pagination
    response = client.get("/events?skip=0&limit=2")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2

    response = client.get("/events?skip=2&limit=2")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert len(data) == 2
    # Don't assert specific event names since order may vary
    assert all(event["name"].startswith("Event ") for event in data)

    # Test sorting by date and time
    response = client.get("/events?sort_by=date")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]["date"] == events[0].date.isoformat()
    assert data[-1]["date"] == events[-1].date.isoformat()

    response = client.get("/events?sort_by=-date")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]["date"] == events[-1].date.isoformat()
    assert data[-1]["date"] == events[0].date.isoformat()

    response = client.get("/events?sort_by=time")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]["time"] == events[0].time.isoformat()
    assert data[-1]["time"] == events[-1].time.isoformat()

    response = client.get("/events?sort_by=-time")
    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data[0]["time"] == events[-1].time.isoformat()
    assert data[-1]["time"] == events[0].time.isoformat()


def test_update_event(client, event, club):
    # Login as club
    response = client.post(
        "/auth/token", data={"username": club.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    dt = datetime.now()
    # Update event
    response = client.patch(
        f"/events/{event.id}",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "id": str(event.id),
            "name": "Updated Event",
            "description": "Updated Description",
            "venue": "Updated Venue",
            "team_size": "2",
            "is_featured": "false",
            "event_type": "TECHNICAL",
            "tagline": "Updated Tagline",
            "application_open": dt.isoformat(),
            "application_close": (dt + timedelta(days=7)).isoformat(),
        },
    )

    assert response.status_code == status.HTTP_200_OK
    data = response.json()
    assert data["name"] == "Updated Event"
    assert data["description"] == "Updated Description"
    assert data["venue"] == "Updated Venue"
    assert data["team_size"] == 2
    assert data["club_id"] == club.id
    assert data["is_featured"] == False
    assert data["event_type"] == "TECHNICAL"
    assert data["tagline"] == "Updated Tagline"
    assert data["application_open"] == dt.isoformat()
    assert data["application_close"] == (dt + timedelta(days=7)).isoformat()


def test_student_cannot_update_event(client, event, student):
    # Login as student
    response = client.post(
        "/auth/token", data={"username": student.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Try to update event
    response = client.patch(
        f"/events/{event.id}",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "id": str(event.id),
            "name": "Updated Event",
            "description": "Updated Description",
        },
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_club_cannot_update_other_clubs_event(client, event, session):
    # Create another club
    password = "testpass123"
    hashed = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())
    other_club = ClubModel(
        name="Other Club",
        email="other@club.com",
        description="Other Description",
        password=hashed.decode("utf-8"),
        acronym="OC",
        logo="other-logo.png",
    )
    session.add(other_club)
    session.commit()

    # Login as other club
    response = client.post(
        "/auth/token", data={"username": other_club.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Try to update event
    response = client.patch(
        f"/events/{event.id}",
        headers={"Authorization": f"Bearer {token}"},
        data={
            "id": str(event.id),
            "name": "Updated Event",
            "description": "Updated Description",
        },
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_delete_event(client, event, club):
    # Login as club
    response = client.post(
        "/auth/token", data={"username": club.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Delete event
    response = client.delete(
        f"/events/{event.id}", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify event is soft deleted
    response = client.get(f"/events/{event.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND


def test_student_cannot_delete_event(client, event, student):
    # Login as student
    response = client.post(
        "/auth/token", data={"username": student.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Try to delete event
    response = client.delete(
        f"/events/{event.id}", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN


def test_permanent_delete_event(client, event, club):
    # Login as club
    response = client.post(
        "/auth/token", data={"username": club.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Create a temporary poster file
    poster_path = event.poster
    with open(poster_path, "wb") as f:
        f.write(b"test content")

    # Permanent delete event
    response = client.delete(
        f"/events/{event.id}/permanent", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_204_NO_CONTENT

    # Verify event is permanently deleted
    response = client.get(f"/events/{event.id}")
    assert response.status_code == status.HTTP_404_NOT_FOUND

    # Verify poster file is deleted
    assert not os.path.exists(poster_path)


def test_student_cannot_permanent_delete_event(client, event, student):
    # Login as student
    response = client.post(
        "/auth/token", data={"username": student.email, "password": "testpass123"}
    )
    assert response.status_code == status.HTTP_200_OK
    token = response.json()["access_token"]

    # Try to permanent delete event
    response = client.delete(
        f"/events/{event.id}/permanent", headers={"Authorization": f"Bearer {token}"}
    )

    assert response.status_code == status.HTTP_403_FORBIDDEN
