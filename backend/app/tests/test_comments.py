def comments_url(ws, proj, tsk):
    return (
        f"/workspaces/{ws['id']}/projects/{proj['id']}/tasks/{tsk['id']}/comments"
    )


def test_member_can_comment_and_list(client, admin, member, ws, proj, tsk):
    url = comments_url(ws, proj, tsk)
    r = client.post(url, json={"body": "Figma ready hai"}, headers=member)
    assert r.status_code == 201
    r = client.get(url, headers=admin)
    assert [c["body"] for c in r.json()] == ["Figma ready hai"]


def test_empty_comment_rejected(client, member, ws, proj, tsk):
    r = client.post(comments_url(ws, proj, tsk), json={"body": ""}, headers=member)
    assert r.status_code == 422


def test_member_cannot_delete_others_comment(client, admin, member, ws, proj, tsk):
    url = comments_url(ws, proj, tsk)
    comment = client.post(url, json={"body": "Admin ka comment"}, headers=admin).json()
    r = client.delete(f"{url}/{comment['id']}", headers=member)
    assert r.status_code == 403


def test_author_can_delete_own(client, member, ws, proj, tsk):
    url = comments_url(ws, proj, tsk)
    comment = client.post(url, json={"body": "Mera comment"}, headers=member).json()
    assert client.delete(f"{url}/{comment['id']}", headers=member).status_code == 204
    assert client.get(url, headers=member).json() == []


def test_admin_can_delete_members_comment(client, admin, member, ws, proj, tsk):
    url = comments_url(ws, proj, tsk)
    comment = client.post(url, json={"body": "Member ka comment"}, headers=member).json()
    assert client.delete(f"{url}/{comment['id']}", headers=admin).status_code == 204


def test_outsider_cannot_comment(client, outsider, ws, proj, tsk):
    r = client.post(comments_url(ws, proj, tsk), json={"body": "Hi"}, headers=outsider)
    assert r.status_code == 404