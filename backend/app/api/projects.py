from fastapi import APIRouter, Depends, Response, status
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.db.dependencies import get_db
from backend.app.models.user import User
from backend.app.schemas.project import (
    ProjectCreate,
    ProjectResponse,
    ProjectUpdate,
)
from backend.app.schemas.project_member import ProjectMemberResponse
from backend.app.services import project_service


router = APIRouter(prefix="/projects", tags=["Projects"])


@router.post("/", response_model=ProjectResponse)
def create_project(
    project: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.create_project(
        db=db,
        project_data=project,
        owner_id=current_user.id,
    )


@router.get("/", response_model=list[ProjectResponse])
def get_projects(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.get_accessible_projects(
        db=db,
        user_id=current_user.id,
    )


@router.get("/{project_id}/info", response_model=ProjectResponse)
def get_project_info(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.get_project(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
    )


@router.put("/{project_id}/info", response_model=ProjectResponse)
def update_project(
    project_id: int,
    project_data: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.update_project(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        project_data=project_data,
    )


@router.delete(
    "/{project_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_project(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project_service.delete_project(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)


@router.post("/{project_id}/invite")
def invite_user(
    project_id: int,
    user: str,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.invite_user(
        db=db,
        project_id=project_id,
        owner_id=current_user.id,
        user_login=user,
    )


@router.get(
    "/{project_id}/members",
    response_model=list[ProjectMemberResponse],
)
def get_project_members(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return project_service.get_project_members(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
    )


@router.delete(
    "/{project_id}/members/{member_user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def remove_project_member(
    project_id: int,
    member_user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    project_service.remove_project_member(
        db=db,
        project_id=project_id,
        member_user_id=member_user_id,
        owner_id=current_user.id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)