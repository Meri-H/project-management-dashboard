from unittest.mock import patch


def test_owner_can_upload_document(client, auth_headers):
    # Arrange
    headers = auth_headers(
        email="document-owner@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=headers,
        json={
            "name": "Document Project",
            "description": "Document upload test",
        },
    ).json()

    fake_storage_key = (
        f"projects/{project['id']}/documents/test-file.pdf"
    )

    # Act
    with patch(
        "backend.app.services.storage_service.save_file",
        return_value=fake_storage_key,
    ):
        response = client.post(
            f"/projects/{project['id']}/documents",
            headers=headers,
            files={
                "file": (
                    "test-file.pdf",
                    b"fake pdf content",
                    "application/pdf",
                )
            },
        )

    # Assert
    assert response.status_code == 200
    assert response.json()["filename"] == "test-file.pdf"
    assert response.json()["project_id"] == project["id"]


def test_owner_can_download_document(client, auth_headers):
    # Arrange
    headers = auth_headers(
        email="download-owner@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=headers,
        json={
            "name": "Download Project",
            "description": "Document download test",
        },
    ).json()

    fake_storage_key = (
        f"projects/{project['id']}/documents/test-download.pdf"
    )

    with patch(
        "backend.app.services.storage_service.save_file",
        return_value=fake_storage_key,
    ):
        upload_response = client.post(
            f"/projects/{project['id']}/documents",
            headers=headers,
            files={
                "file": (
                    "test-download.pdf",
                    b"original content",
                    "application/pdf",
                )
            },
        )

    document_id = upload_response.json()["id"]

    fake_file_bytes = b"downloaded pdf content"

    # Act
    with patch(
        "backend.app.services.storage_service.read_file",
        return_value=fake_file_bytes,
    ):
        response = client.get(
            f"/documents/{document_id}",
            headers=headers,
        )

    # Assert
    assert response.status_code == 200
    assert response.content == fake_file_bytes
    assert response.headers["content-type"] == "application/pdf"


def test_owner_can_delete_document(client, auth_headers):
    # Arrange
    headers = auth_headers(
        email="delete-document-owner@example.com",
        password="12345678",
    )

    project = client.post(
        "/projects/",
        headers=headers,
        json={
            "name": "Delete Document Project",
            "description": "Document deletion test",
        },
    ).json()

    fake_storage_key = (
        f"projects/{project['id']}/documents/delete-test.pdf"
    )

    with patch(
        "backend.app.services.storage_service.save_file",
        return_value=fake_storage_key,
    ):
        upload_response = client.post(
            f"/projects/{project['id']}/documents",
            headers=headers,
            files={
                "file": (
                    "delete-test.pdf",
                    b"fake content",
                    "application/pdf",
                )
            },
        )

    document_id = upload_response.json()["id"]

    # Act
    with patch(
        "backend.app.services.storage_service.delete_file"
    ) as mock_delete:
        response = client.delete(
            f"/documents/{document_id}",
            headers=headers,
        )

    # Assert
    assert response.status_code == 204
    mock_delete.assert_called_once_with(fake_storage_key)