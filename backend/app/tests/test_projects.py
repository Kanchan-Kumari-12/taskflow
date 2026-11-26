def projects_url(ws):
    return f"/workspaces/{ws['id']}/projects"


def test_member_can_list_projects(client, member, ws, proj):
    r = client.get(projects_url(ws), headers=member)
    assert r.status_code == 200
    assert len(r.json()) == 1


def test_member_cannot_create_project(client, member, ws):
    r = client.post(projects_url(ws), json={"name": "Hack"}, headers=member)
    assert r.status_code == 403


def test_outsider_cannot_see_projects(client, outsider, ws, proj):
    assert client.get(projects_url(ws), headers=outsider).status_code == 404


def test_project_not_reachable_from_other_workspace(client, admin, ws, proj):
    other = client.post("/workspaces", json={"name": "Other"}, headers=admin).json()
    r = client.get(f"{projects_url(other)}/{proj['id']}", headers=admin)
    assert r.status_code == 404


def test_project_name_required(client, admin, ws):
    r = client.post(projects_url(ws), json={"name": ""}, headers=admin)
    assert r.status_code == 422