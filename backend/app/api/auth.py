from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from backend.app.db.dependencies import get_db
from backend.app.schemas.user import UserRegister, UserResponse, UserLogin
from backend.app.services import user_service

router = APIRouter(tags=["Auth"])


@router.post("/auth", response_model=UserResponse)
def register_user(
    user: UserRegister,
    db: Session = Depends(get_db),
):
    return user_service.register_user(db, user)

@router.post("/login", response_model=UserResponse)
def login_user(
    credentials: UserLogin,
    db: Session = Depends(get_db),
):
    return user_service.login_user(db, credentials)