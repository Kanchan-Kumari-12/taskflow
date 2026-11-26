import uuid


def tasks_url(ws, proj):
    return f"/workspaces/{ws['id']}/projects/{proj['id']}/tasks"


def user_id(client, headers):
    return client.get("/auth/me", headers=headers).json()["id"]


def test_member_can_create_task(client, member, ws, proj):
    r = client.post(tasks_url(ws, proj), json={"title": "Footer"}, headers=member)
    assert r.status_code == 201
    assert r.json()["status"] == "todo"
    assert r.json()["assignee_id"] is None


def test_assign_to_workspace_member(client, admin, member, ws, proj):
    rahul = user_id(client, member)
    r = client.post(
        tasks_url(ws, proj),
        json={"title": "Footer", "assignee_id": rahul},
        headers=admin,
    )
    assert r.status_code == 201
    assert r.json()["assignee_id"] == rahul


def test_assignee_must_be_workspace_member(client, admin, outsider, ws, proj):
    for bad_id in (user_id(client, outsider), str(uuid.uuid4())):
        r = client.post(
            tasks_url(ws, proj),
            json={"title": "Footer", "assignee_id": bad_id},
            headers=admin,
        )
        assert r.status_code == 400


def test_update_status_keeps_other_fields(client, member, ws, proj, tsk):
    r = client.patch(
        f"{tasks_url(ws, proj)}/{tsk['id']}",
        json={"status": "in_progress"},
        headers=member,
    )
    assert r.status_code == 200
    assert r.json()["status"] == "in_progress"
    assert r.json()["title"] == tsk["title"]


def test_unassign_task(client, admin, member, ws, proj):
    rahul = user_id(client, member)
    task = client.post(
        tasks_url(ws, proj),
        json={"title": "Footer", "assignee_id": rahul},
        headers=admin,
    ).json()
    r = client.patch(
        f"{tasks_url(ws, proj)}/{task['id']}",
        json={"assignee_id": None},
        headers=admin,
    )
    assert r.status_code == 200
    assert r.json()["assignee_id"] is None


def test_filter_by_status(client, admin, ws, proj, tsk):
    base = tasks_url(ws, proj)
    client.patch(f"{base}/{tsk['id']}", json={"status": "done"}, headers=admin)
    client.post(base, json={"title": "Footer"}, headers=admin)

    r = client.get(f"{base}?status=done", headers=admin)
    assert r.status_code == 200
    assert [t["id"] for t in r.json()] == [tsk["id"]]


def test_invalid_status(client, admin, ws, proj):
    r = client.post(
        tasks_url(ws, proj), json={"title": "X", "status": "galat"}, headers=admin
    )
    assert r.status_code == 422


def test_member_cannot_delete_task(client, member, ws, proj, tsk):
    r = client.delete(f"{tasks_url(ws, proj)}/{tsk['id']}", headers=member)
    assert r.status_code == 403


def test_admin_can_delete_task(client, admin, ws, proj, tsk):
    url = f"{tasks_url(ws, proj)}/{tsk['id']}"
    assert client.delete(url, headers=admin).status_code == 204
    assert client.get(url, headers=admin).status_code == 404


def test_outsider_cannot_access_tasks(client, outsider, ws, proj, tsk):
    assert client.get(tasks_url(ws, proj), headers=outsider).status_code == 404