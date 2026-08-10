from fastapi import FastAPI
from sqlalchemy import text

from backend.app.db.database import engine
from fastapi import Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from backend.app.db.dependencies import get_db
from backend.app.api.users import router as users_router
from backend.app.core.exception_handlers import register_exception_handlers
from backend.app.api.auth import router as auth_router
from backend.app.api.projects import router as projects_router
from backend.app.api.documents import router as documents_router

app = FastAPI(title="Project Management Dashboard API")
register_exception_handlers(app)
app.include_router(users_router)
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