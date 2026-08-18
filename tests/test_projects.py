def test_owner_can_create_project(client, auth_headers):
    # Arrange
    headers = auth_headers(
        email="project-owner@example.com",
        password="12345678",
    )

    project_data = {
        "name": "Pytest Project",
        "description": "Created during automated testing",
    }

    # Act
    response = client.post(
        "/projects/",
        json=project_data,
        headers=headers,
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == "Pytest Project"
    assert response.json()["owner_email"] == "project-owner@example.com"


def test_owner_can_get_project(client, auth_headers):
    # Arrange
    headers = auth_headers(
        email="get-owner@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=headers,
        json={
            "name": "Readable Project",
            "description": "Testing project access",
        },
    ).json()

    # Act
    response = client.get(
        f"/projects/{project['id']}/info",
        headers=headers,
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == project["id"]
    assert response.json()["name"] == "Readable Project"


def test_owner_can_update_project(client, auth_headers):
    # Arrange
    headers = auth_headers(
        email="update-owner@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=headers,
        json={
            "name": "Old Name",
            "description": "Old description",
        },
    ).json()

    # Act
    response = client.put(
        f"/projects/{project['id']}/info",
        headers=headers,
        json={
            "name": "Updated Name",
            "description": "Updated description",
        },
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"
    assert response.json()["description"] == "Updated description"


def test_owner_can_delete_project(client, auth_headers):
    # Arrange
    headers = auth_headers(
        email="delete-owner@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=headers,
        json={
            "name": "Delete Me",
            "description": "Project delete test",
        },
    ).json()

    # Act
    response = client.delete(
        f"/projects/{project['id']}",
        headers=headers,
    )

    # Assert
    assert response.status_code == 204


def test_participant_can_view_project(client, auth_headers):
    # Arrange
    owner_headers = auth_headers(
        email="view-owner@example.com",
        password="12345678",
    )

    participant_headers = auth_headers(
        email="view-participant@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=owner_headers,
        json={
            "name": "Shared Project",
            "description": "Participant view test",
        },
    ).json()

    invite_response = client.post(
        f"/projects/{project['id']}/invite",
        params={"user": "view-participant@example.com"},
        headers=owner_headers,
    )

    assert invite_response.status_code == 200

    # Act
    response = client.get(
        f"/projects/{project['id']}/info",
        headers=participant_headers,
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["id"] == project["id"]


def test_participant_can_update_project(client, auth_headers):
    # Arrange
    owner_headers = auth_headers(
        email="participant-update-owner@example.com",
        password="12345678",
    )

    participant_headers = auth_headers(
        email="update-participant@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=owner_headers,
        json={
            "name": "Before Update",
            "description": "Participant update test",
        },
    ).json()

    invite_response = client.post(
        f"/projects/{project['id']}/invite",
        params={"user": "update-participant@example.com"},
        headers=owner_headers,
    )

    assert invite_response.status_code == 200

    # Act
    response = client.put(
        f"/projects/{project['id']}/info",
        headers=participant_headers,
        json={
            "name": "Updated By Participant",
            "description": "Participant can modify",
        },
    )

    # Assert
    assert response.status_code == 200
    assert response.json()["name"] == "Updated By Participant"


def test_participant_cannot_delete_project(client, auth_headers):
    # Arrange
    owner_headers = auth_headers(
        email="delete-permission-owner@example.com",
        password="12345678",
    )

    participant_headers = auth_headers(
        email="delete-permission-participant@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=owner_headers,
        json={
            "name": "Protected Project",
            "description": "Participant cannot delete",
        },
    ).json()

    invite_response = client.post(
        f"/projects/{project['id']}/invite",
        params={"user": "delete-permission-participant@example.com"},
        headers=owner_headers,
    )

    assert invite_response.status_code == 200

    # Act
    response = client.delete(
        f"/projects/{project['id']}",
        headers=participant_headers,
    )

    # Assert
    assert response.status_code == 403


def test_non_member_cannot_access_project(client, auth_headers):
    # Arrange
    owner_headers = auth_headers(
        email="private-owner@example.com",
        password="12345678",
    )

    outsider_headers = auth_headers(
        email="outsider@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=owner_headers,
        json={
            "name": "Private Project",
            "description": "Non-member access test",
        },
    ).json()

    # Act
    response = client.get(
        f"/projects/{project['id']}/info",
        headers=outsider_headers,
    )

    # Assert
    assert response.status_code == 404


def test_owner_can_remove_participant(client, auth_headers):
    # Arrange
    owner_headers = auth_headers(
        email="remove-owner@example.com",
        password="12345678",
    )

    participant_headers = auth_headers(
        email="remove-participant@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=owner_headers,
        json={
            "name": "Member Test",
            "description": "Remove participant",
        },
    ).json()

    invite_response = client.post(
        f"/projects/{project['id']}/invite",
        params={"user": "remove-participant@example.com"},
        headers=owner_headers,
    )

    assert invite_response.status_code == 200

    # Get participant ID from authenticated user data
    participant_projects = client.get(
        "/projects/",
        headers=participant_headers,
    )

    assert participant_projects.status_code == 200

    members_response = client.get(
        f"/projects/{project['id']}/members",
        headers=owner_headers,
    )

    assert members_response.status_code == 200

    members = members_response.json()

    participant = next(
        member
        for member in members
        if member["email"] == "remove-participant@example.com"
    )

    # Act
    response = client.delete(
        f"/projects/{project['id']}/members/{participant['user_id']}",
        headers=owner_headers,
    )

    # Assert
    assert response.status_code == 204


def test_participant_cannot_remove_another_participant(
    client,
    auth_headers,
):
    # Arrange
    owner_headers = auth_headers(
        email="member-owner@example.com",
        password="12345678",
    )

    participant_one_headers = auth_headers(
        email="participant-one@example.com",
        password="12345678",
    )

    auth_headers(
        email="participant-two@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=owner_headers,
        json={
            "name": "Permission Test",
            "description": "Participant removal restriction",
        },
    ).json()

    client.post(
        f"/projects/{project['id']}/invite",
        params={"user": "participant-one@example.com"},
        headers=owner_headers,
    )

    client.post(
        f"/projects/{project['id']}/invite",
        params={"user": "participant-two@example.com"},
        headers=owner_headers,
    )

    members_response = client.get(
        f"/projects/{project['id']}/members",
        headers=owner_headers,
    )

    participant_two = next(
        member
        for member in members_response.json()
        if member["email"] == "participant-two@example.com"
    )

    # Act
    response = client.delete(
        (
            f"/projects/{project['id']}/members/"
            f"{participant_two['user_id']}"
        ),
        headers=participant_one_headers,
    )

    # Assert
    assert response.status_code == 403