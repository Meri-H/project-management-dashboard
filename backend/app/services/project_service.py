from backend.app.models import Project
from backend.app.models.project_member import ProjectMember
from sqlalchemy.orm import Session
from backend.app.core.exceptions import ProjectNotFoundException, ProjectOwnerRequiredException, UserNotFoundException, UserAlreadyMemberException
from backend.app.schemas.project import ProjectCreate, ProjectUpdate
from backend.app.models.user import User
from backend.app.models.document import Document
from backend.app.services import storage_service

def create_project(
    db: Session,
    project_data: ProjectCreate,
    owner_id: int,
):
    project = Project(
        name=project_data.name,
        description=project_data.description,
        owner_id=owner_id,
    )

    db.add(project)
    db.commit()
    db.refresh(project)

    return project

def get_accessible_projects(
    db: Session,
    user_id: int,
):
    owned_projects = (
        db.query(Project)
        .filter(Project.owner_id == user_id)
        .all()
    )

    member_project_ids = (
        db.query(ProjectMember.project_id)
        .filter(ProjectMember.user_id == user_id)
        .all()
    )

    member_project_ids = [project_id for (project_id,) in member_project_ids]

    shared_projects = (
        db.query(Project)
        .filter(Project.id.in_(member_project_ids))
        .all()
        if member_project_ids
        else []
    )

    return owned_projects + shared_projects

def get_project(
    db: Session,
    project_id: int,
    user_id: int,
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise ProjectNotFoundException()

    if project.owner_id == user_id:
        return project

    membership = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
        .first()
    )

    if not membership:
        raise ProjectNotFoundException()

    return project

def update_project(
    db: Session,
    project_id: int,
    user_id: int,
    project_data: ProjectUpdate,
):
    project = get_project(
        db=db,
        project_id=project_id,
        user_id=user_id,
    )

    project.name = project_data.name
    project.description = project_data.description

    db.commit()
    db.refresh(project)

    return project


def delete_project(
    db: Session,
    project_id: int,
    user_id: int,
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise ProjectNotFoundException()

    if project.owner_id != user_id:
        raise ProjectOwnerRequiredException()

    # Get document paths before deleting DB records
    documents = (
        db.query(Document)
        .filter(Document.project_id == project_id)
        .all()
    )

    storage_keys = [document.storage_key for document in documents]

    # Delete child records first
    db.query(Document).filter(
        Document.project_id == project_id
    ).delete(synchronize_session=False)

    db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).delete(synchronize_session=False)

    # Force those DELETEs to PostgreSQL now
    db.flush()

    # Now no child rows reference the project
    db.delete(project)

    db.commit()

    # Finally remove physical files
    for storage_key in storage_keys:
        storage_service.delete_file(storage_key)

def invite_user(
    db: Session,
    project_id: int,
    owner_id: int,
    user_login: str,
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise ProjectNotFoundException()

    if project.owner_id != owner_id:
        raise ProjectOwnerRequiredException()

    user = (
        db.query(User)
        .filter(User.email == user_login)
        .first()
    )

    if not user:
        raise UserNotFoundException()

    existing_member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user.id,
        )
        .first()
    )

    if existing_member:
        raise UserAlreadyMemberException()

    member = ProjectMember(
        project_id=project_id,
        user_id=user.id,
        role="participant",
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return member