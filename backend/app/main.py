from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.db.database import engine
from backend.app.db.dependencies import get_db
from backend.app.core.exception_handlers import register_exception_handlers
from backend.app.api.auth import router as auth_router
from backend.app.api.projects import router as projects_router
from backend.app.api.documents import router as documents_router
from backend.app.services import lambda_service
from fastapi import Depends
from backend.app.core.security import get_current_user
from backend.app.models.user import User


app = FastAPI(title="Project Management Dashboard API")

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

register_exception_handlers(app)
app.include_router(auth_router)
app.include_router(projects_router)
app.include_router(documents_router)

@app.get("/")
def read_root():
    return {"message": "API is running"}


@app.get("/health/database")
def database_health():
    with engine.connect() as connection:
        connection.execute(text("SELECT 1"))

    return {"database": "connected"}

@app.get("/health/database-session")
def database_session_health(
    db: Session = Depends(get_db),
):
    db.execute(text("SELECT 1"))

    return {"database_session": "working"}


@app.get("/lambda/test")
def test_lambda(
    current_user: User = Depends(get_current_user),
):
    return lambda_service.process_project(
        "Project Management Dashboard"
    )