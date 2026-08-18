from backend.app.core.security import hash_password, verify_password


def test_hash_password_changes_password():
    # Arrange
    password = "12345678"

    # Act
    hashed = hash_password(password)

    # Assert
    assert hashed != password


def test_verify_password_with_correct_password():
    # Arrange
    password = "12345678"
    hashed = hash_password(password)

    # Act
    result = verify_password(password, hashed)

    # Assert
    assert result is True


def test_verify_password_with_wrong_password():
    # Arrange
    hashed = hash_password("12345678")

    # Act
    result = verify_password("wrongpassword", hashed)

    # Assert
    assert result is False