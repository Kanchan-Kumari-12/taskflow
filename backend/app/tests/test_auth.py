def test_health(client):
    r = client.get("/health")
    assert r.status_code == 200
    assert r.json() == {"status": "ok"}


def test_register_success(client):
    r = client.post(
        "/auth/register",
        json={"name": "Kanchan", "email": "k@example.com", "password": "secret123"},
    )
    assert r.status_code == 201
    body = r.json()
    assert body["email"] == "k@example.com"
    assert "password" not in body
    assert "password_hash" not in body


def test_register_duplicate_email(client):
    payload = {"name": "Kanchan", "email": "k@example.com", "password": "secret123"}
    assert client.post("/auth/register", json=payload).status_code == 201
    r = client.post("/auth/register", json=payload)
    assert r.status_code == 409


def test_email_is_case_insensitive(client):
    client.post(
        "/auth/register",
        json={"name": "A", "email": "Kanchan@Example.com", "password": "secret123"},
    )
    r = client.post(
        "/auth/register",
        json={"name": "B", "email": "kanchan@example.com", "password": "secret123"},
    )
    assert r.status_code == 409


def test_register_short_password(client):
    r = client.post(
        "/auth/register",
        json={"name": "Kanchan", "email": "k@example.com", "password": "abc"},
    )
    assert r.status_code == 422


def test_login_success(client, admin):
    r = client.post(
        "/auth/login",
        data={"username": "kanchan@example.com", "password": "secret123"},
    )
    assert r.status_code == 200
    assert r.json()["token_type"] == "bearer"
    assert r.json()["access_token"]


def test_login_wrong_password(client, admin):
    r = client.post(
        "/auth/login",
        data={"username": "kanchan@example.com", "password": "galat-password"},
    )
    assert r.status_code == 401


def test_me_requires_token(client):
    assert client.get("/auth/me").status_code == 401


def test_me_with_bad_token(client):
    r = client.get("/auth/me", headers={"Authorization": "Bearer garbage"})
    assert r.status_code == 401


def test_me_with_token(client, admin):
    r = client.get("/auth/me", headers=admin)
    assert r.status_code == 200
    assert r.json()["email"] == "kanchan@example.com"