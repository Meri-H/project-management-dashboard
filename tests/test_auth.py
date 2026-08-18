def test_register_with_short_password(client):
    # Arrange
    data = {
        "login": "short-password@example.com",
        "password": "1234567",
        "repeat_password": "1234567",
    }

    # Act
    response = client.post("/auth", json=data)

    # Assert
    assert response.status_code == 422


def test_register_with_mismatched_passwords(client):
    # Arrange
    data = {
        "login": "mismatch@example.com",
        "password": "12345678",
        "repeat_password": "87654321",
    }

    # Act
    response = client.post("/auth", json=data)

    # Assert
    assert response.status_code == 400


def test_register_successfully(client):
    # Arrange
    data = {
        "login": "pytest-user@example.com",
        "password": "12345678",
        "repeat_password": "12345678",
    }

    # Act
    response = client.post("/auth", json=data)

    # Assert
    assert response.status_code == 200
    assert response.json()["email"] == "pytest-user@example.com"

def test_login_successfully(client):
    # Arrange
    register_data = {
        "login": "login-test@example.com",
        "password": "12345678",
        "repeat_password": "12345678",
    }

    client.post("/auth", json=register_data)

    login_data = {
        "login": "login-test@example.com",
        "password": "12345678",
    }

    # Act
    response = client.post(
        "/login",
        json=login_data,
    )

    # Assert
    assert response.status_code == 200

    body = response.json()

    assert "access_token" in body
    assert body["token_type"] == "bearer"
    assert body["user"]["email"] == "login-test@example.com"

def test_login_with_invalid_password(client):
    # Arrange
    register_data = {
        "login": "invalid-login@example.com",
        "password": "12345678",
        "repeat_password": "12345678",
    }

    client.post("/auth", json=register_data)

    login_data = {
        "login": "invalid-login@example.com",
        "password": "wrongpassword",
    }

    # Act
    response = client.post("/login", json=login_data)

    # Assert
    assert response.status_code == 401