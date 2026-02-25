import pytest
from dotenv import load_dotenv
from sqlmodel import Session, create_engine
from sqlmodel.main import SQLModel
from sqlmodel.pool import StaticPool
from fastapi.testclient import TestClient
from backend.database import get_session
from backend.main import app

TEST_DATABASE_URL = "sqlite://"


@pytest.fixture(name="test_engine")
def test_engine_fixture():
    engine = create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )

    SQLModel.metadata.drop_all(engine)
    SQLModel.metadata.create_all(engine)

    return engine


@pytest.fixture(name="session")
def session_fixture(test_engine):
    with Session(test_engine) as session:
        yield session


@pytest.fixture(name="client")
def client_fixture(session: Session, test_engine):
    def get_session_override():
        yield session

    app.dependency_overrides[get_session] = get_session_override

    load_dotenv()
    client = TestClient(app)

    yield client

    app.dependency_overrides.clear()
