def test_protected_endpoint_without_token(client):
    # Act
    response = client.get("/projects/")

    # Assert
    assert response.status_code == 401

def test_protected_endpoint_with_invalid_token(client):
    response = client.get(
        "/projects/",
        headers={
            "Authorization": "Bearer invalid-token"
        },
    )

    assert response.status_code == 401