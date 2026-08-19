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

class PasswordsDoNotMatchException(AppException):
    def __init__(self):
        super().__init__(
            message="Passwords do not match",
            status_code=400,
        )

class ProjectNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="Project not found or access denied",
            status_code=404,
        )

class ProjectOwnerRequiredException(AppException):
    def __init__(self):
        super().__init__(
            message="Only the project owner can perform this action",
            status_code=403,
        )

class UserNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="User not found",
            status_code=404,
        )


class UserAlreadyMemberException(AppException):
    def __init__(self):
        super().__init__(
            message="User already has access to this project",
            status_code=409,
        )

class ProjectMemberNotFoundException(AppException):
    def __init__(self):
        super().__init__(
            message="Project participant not found",
            status_code=404,
        )

class InvalidTokenException(AppException):
    def __init__(self):
        super().__init__(
            message="Invalid or expired access token",
            status_code=401,
        )