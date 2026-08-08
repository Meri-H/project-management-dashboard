from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.dependencies import get_db
from backend.app.schemas.user import UserCreate, UserResponse
from backend.app.services import user_service

router = APIRouter(prefix="/users", tags=["Users"])


@router.get("/", response_model=list[UserResponse])
def get_users(db: Session = Depends(get_db)):
    return user_service.get_users(db)


@router.post("/", response_model=UserResponse)
def create_user(
    user: UserCreate,
    db: Session = Depends(get_db),
):
    return user_service.create_user(db, user)