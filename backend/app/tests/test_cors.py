def preflight(client, origin):
    return client.options(
        "/auth/login",
        headers={
            "Origin": origin,
            "Access-Control-Request-Method": "POST",
        },
    )


def test_allowed_origin(client):
    r = preflight(client, "http://localhost:5173")
    assert r.status_code == 200
    assert r.headers["access-control-allow-origin"] == "http://localhost:5173"


def test_unknown_origin_not_allowed(client):
    r = preflight(client, "http://evil.com")
    assert "access-control-allow-origin" not in r.headers