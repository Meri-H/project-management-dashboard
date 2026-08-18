import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

from backend.app.db.base import Base
from backend.app.db.dependencies import get_db
from backend.app.main import app


TEST_DATABASE_URL = (
    "postgresql+psycopg2://admin:password@127.0.0.1:5433/"
    "project_management_test"
)


test_engine = create_engine(TEST_DATABASE_URL)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


@pytest.fixture(scope="session", autouse=True)
def prepare_test_database():
    Base.metadata.create_all(bind=test_engine)

    yield

    Base.metadata.drop_all(bind=test_engine)


@pytest.fixture
def db_session():
    connection = test_engine.connect()
    transaction = connection.begin()

    session = TestingSessionLocal(bind=connection)

    yield session

    session.close()
    transaction.rollback()
    connection.close()


@pytest.fixture
def client(db_session):
    def override_get_db():
        try:
            yield db_session
        finally:
            pass

    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()

@pytest.fixture
def auth_headers(client):
    def _auth_headers(
        email="jwt-test@example.com",
        password="12345678",
    ):
        client.post(
            "/auth",
            json={
                "login": email,
                "password": password,
                "repeat_password": password,
            },
        )

        response = client.post(
            "/login",
            json={
                "login": email,
                "password": password,
            },
        )

        token = response.json()["access_token"]

        return {
            "Authorization": f"Bearer {token}"
        }

    return _auth_headers