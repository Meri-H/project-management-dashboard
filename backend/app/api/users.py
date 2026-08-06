from fastapi import APIRouter, Depends

from sqlalchemy.orm import Session

from backend.app.db.dependencies import get_db
from backend.app.schemas.user import UserResponse
from backend.app.models.user import User
from backend.app.schemas.user import UserCreate

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserResponse])
def get_users(
    db: Session = Depends(get_db),
):
    users = db.query(User).all()

    return users

@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    db_user = User(
        email=user.email,
        full_name=user.full_name,
        hashed_password=user.password,  # Temporary! We'll hash it later.
    )

    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user