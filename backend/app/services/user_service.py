from sqlalchemy.orm import Session
from backend.app.schemas.user import UserRegister
from backend.app.core.security import hash_password, verify_password
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate
from backend.app.core.exceptions import UserAlreadyExistsException
from backend.app.core.exceptions import PasswordsDoNotMatchException
from backend.app.core.exceptions import InvalidCredentialsException
from backend.app.schemas.user import UserLogin

def login_user(db: Session, credentials: UserLogin):
    user = (
        db.query(User)
        .filter(User.email == credentials.login)
        .first()
    )

    if not user or not verify_password(
            credentials.password,
            user.hashed_password
    ):
        raise InvalidCredentialsException()

    return user

def register_user(db: Session, user: UserRegister):
    if user.password != user.repeat_password:
        raise PasswordsDoNotMatchException()

    existing_user = (
        db.query(User)
        .filter(User.email == user.login)
        .first()
    )

    if existing_user:
        raise UserAlreadyExistsException()

    db_user = User(
        email=user.login,
        full_name=user.login,
        hashed_password=hash_password(user.password),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user

def get_users(db: Session):
    return db.query(User).all()


def create_user(db: Session, user: UserCreate):
    existing_user = db.query(User).filter(User.email == user.email).first()

    if existing_user:
        raise UserAlreadyExistsException()

    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=hash_password(user.password),
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user