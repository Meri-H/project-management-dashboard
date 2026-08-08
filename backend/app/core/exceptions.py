class AppException(Exception):
    def __init__(self, message: str, status_code: int = 400):
        self.message = message
        self.status_code = status_code
        super().__init__(message)


class UserAlreadyExistsException(AppException):
    def __init__(self):
        super().__init__(
            message="User with this email already exists",
            status_code=409,
        )


class InvalidCredentialsException(AppException):
    def __init__(self):
        super().__init__(
            message="Invalid email or password",
            status_code=401,
        )