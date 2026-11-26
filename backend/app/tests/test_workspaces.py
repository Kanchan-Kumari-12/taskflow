def members_url(ws):
    return f"/workspaces/{ws['id']}/members"


def test_creator_becomes_admin(client, admin):
    r = client.post("/workspaces", json={"name": "Team"}, headers=admin)
    assert r.status_code == 201
    r = client.get(members_url(r.json()), headers=admin)
    assert r.json()[0]["role"] == "admin"


def test_workspaces_list_only_mine(client, admin, outsider, ws):
    assert len(client.get("/workspaces", headers=admin).json()) == 1
    assert client.get("/workspaces", headers=outsider).json() == []


def test_admin_can_add_member(client, admin, ws):
    r = client.get(members_url(ws), headers=admin)
    roles = {m["email"]: m["role"] for m in r.json()}
    assert roles == {"kanchan@example.com": "admin", "rahul@example.com": "member"}


def test_member_cannot_add_member(client, member, outsider, ws):
    r = client.post(
        members_url(ws), json={"email": "outsider@example.com"}, headers=member
    )
    assert r.status_code == 403


def test_add_duplicate_member(client, admin, ws):
    r = client.post(
        members_url(ws), json={"email": "rahul@example.com"}, headers=admin
    )
    assert r.status_code == 409


def test_add_unknown_email(client, admin, ws):
    r = client.post(
        members_url(ws), json={"email": "nobody@example.com"}, headers=admin
    )
    assert r.status_code == 404


def test_invalid_role(client, admin, outsider, ws):
    r = client.post(
        members_url(ws),
        json={"email": "outsider@example.com", "role": "boss"},
        headers=admin,
    )
    assert r.status_code == 422


def test_outsider_gets_404(client, outsider, ws):
    assert client.get(members_url(ws), headers=outsider).status_code == 404


def test_workspace_requires_login(client):
    assert client.get("/workspaces").status_code == 401