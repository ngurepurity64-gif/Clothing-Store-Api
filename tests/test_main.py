import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from database import get_db
from models import Base


# Use a separate in-memory database for tests.
test_engine = create_engine(
    "sqlite://",
    connect_args={"check_same_thread": False},
    poolclass=StaticPool,
)

TestingSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=test_engine,
)


def override_get_db():
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    Base.metadata.create_all(bind=test_engine)
    app.dependency_overrides[get_db] = override_get_db

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
    Base.metadata.drop_all(bind=test_engine)


def get_auth_headers(client):
    # Register a test user.
    register_response = client.post(
        "/register",
        json={
            "email": "test@example.com",
            "password": "TestPassword123!",
        },
    )
    assert register_response.status_code == 201

    # Log in to receive an access token.
    login_response = client.post(
        "/login",
        data={
            "username": "test@example.com",
            "password": "TestPassword123!",
        },
    )
    assert login_response.status_code == 200

    token = login_response.json()["access_token"]

    return {"Authorization": f"Bearer {token}"}


def test_health_returns_200(client):
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_post_clothes_creates_item(client):
    headers = get_auth_headers(client)

    response = client.post(
        "/clothes",
        headers=headers,
        json={
            "name": "Test Shirt",
            "brand": "Test Brand",
            "color": "Blue",
            "size": "M",
            "quantity": 5,
            "price": "19.99",
        },
    )

    assert response.status_code == 200
    assert response.json()["name"] == "Test Shirt"
    assert response.json()["quantity"] == 5
    assert "clothing_id" in response.json()


def test_get_clothes_bad_id_returns_404(client):
    response = client.get("/clothes/999999")

    assert response.status_code == 404


def test_negative_quantity_returns_422(client):
    headers = get_auth_headers(client)

    response = client.post(
        "/clothes",
        headers=headers,
        json={
            "name": "Invalid Shirt",
            "brand": "Test Brand",
            "color": "Red",
            "size": "M",
            "quantity": -1,
            "price": "19.99",
        },
    )

    assert response.status_code == 422


def test_unauthenticated_post_returns_401(client):
    response = client.post(
        "/clothes",
        json={
            "name": "Unauthorized Shirt",
            "brand": "Test Brand",
            "color": "Black",
            "size": "L",
            "quantity": 2,
            "price": "19.99",
        },
    )

    assert response.status_code == 401