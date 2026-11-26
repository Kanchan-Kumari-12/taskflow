import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine, text
from sqlalchemy.orm import sessionmaker

from app.core.config import settings
from app.db.session import Base, get_db
from app.main import app
from app.models import (  # noqa: F401
    comment,
    project,
    task,
    user,
    workspace,
    workspace_member,
)

TEST_DATABASE_URL = settings.DATABASE_URL.rsplit("/", 1)[0] + "/taskflow_test"
engine = create_engine(TEST_DATABASE_URL)
TestingSession = sessionmaker(bind=engine, autoflush=False)


@pytest.fixture(scope="session", autouse=True)
def create_tables():
    Base.metadata.create_all(engine)
    yield
    Base.metadata.drop_all(engine)


@pytest.fixture(autouse=True)
def clean_tables():
    yield
    names = ", ".join(f'"{t.name}"' for t in Base.metadata.sorted_tables)
    with engine.begin() as conn:
        conn.execute(text(f"TRUNCATE {names} CASCADE"))


def override_get_db():
    db = TestingSession()
    try:
        yield db
    finally:
        db.close()


@pytest.fixture
def client():
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c
    app.dependency_overrides.clear()


def make_user(client, name, email, password="secret123"):
    r = client.post(
        "/auth/register", json={"name": name, "email": email, "password": password}
    )
    assert r.status_code == 201
    r = client.post("/auth/login", data={"username": email, "password": password})
    assert r.status_code == 200
    return {"Authorization": f"Bearer {r.json()['access_token']}"}


@pytest.fixture
def admin(client):
    return make_user(client, "Kanchan", "kanchan@example.com")


@pytest.fixture
def member(client):
    return make_user(client, "Rahul", "rahul@example.com")

@pytest.fixture
def outsider(client):
    return make_user(client, "Outsider", "outsider@example.com")


@pytest.fixture
def ws(client, admin, member):
    r = client.post("/workspaces", json={"name": "My Team"}, headers=admin)
    assert r.status_code == 201
    data = r.json()
    r = client.post(
        f"/workspaces/{data['id']}/members",
        json={"email": "rahul@example.com", "role": "member"},
        headers=admin,
    )
    assert r.status_code == 201
    return data


@pytest.fixture
def proj(client, admin, ws):
    r = client.post(
        f"/workspaces/{ws['id']}/projects", json={"name": "Website"}, headers=admin
    )
    assert r.status_code == 201
    return r.json()


@pytest.fixture
def tsk(client, admin, ws, proj):
    r = client.post(
        f"/workspaces/{ws['id']}/projects/{proj['id']}/tasks",
        json={"title": "Navbar"},
        headers=admin,
    )
    assert r.status_code == 201
    return r.json()