from sqlalchemy.orm import Session

from backend.app.models.project import Project
from backend.app.models.project_member import ProjectMember
from backend.app.models.document import Document
from backend.app.models.user import User

from backend.app.schemas.project import ProjectCreate, ProjectUpdate

from backend.app.core.exceptions import (
    ProjectNotFoundException,
    ProjectOwnerRequiredException,
    UserNotFoundException,
    ProjectMemberNotFoundException,
)

from backend.app.services import storage_service


def project_to_response_data(
    db: Session,
    project: Project,
):
    owner = (
        db.query(User)
        .filter(User.id == project.owner_id)
        .first()
    )

    return {
        "id": project.id,
        "name": project.name,
        "description": project.description,
        "owner_id": project.owner_id,
        "owner_email": owner.email,
        "created_at": project.created_at,
        "updated_at": project.updated_at,
    }


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

    return project_to_response_data(db, project)


def get_accessible_projects(
    db: Session,
    user_id: int,
):
    owned_projects = (
        db.query(Project)
        .filter(Project.owner_id == user_id)
        .all()
    )

    shared_projects = (
        db.query(Project)
        .join(
            ProjectMember,
            ProjectMember.project_id == Project.id,
        )
        .filter(ProjectMember.user_id == user_id)
        .all()
    )

    projects = owned_projects + shared_projects

    return [
        project_to_response_data(db, project)
        for project in projects
    ]


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

    is_owner = project.owner_id == user_id

    is_member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
        .first()
        is not None
    )

    if not is_owner and not is_member:
        raise ProjectNotFoundException()

    return project_to_response_data(db, project)


def update_project(
    db: Session,
    project_id: int,
    user_id: int,
    project_data: ProjectUpdate,
):
    project = (
        db.query(Project)
        .filter(Project.id == project_id)
        .first()
    )

    if not project:
        raise ProjectNotFoundException()

    is_owner = project.owner_id == user_id

    is_member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == user_id,
        )
        .first()
        is not None
    )

    if not is_owner and not is_member:
        raise ProjectNotFoundException()

    project.name = project_data.name
    project.description = project_data.description

    db.commit()
    db.refresh(project)

    return project_to_response_data(db, project)


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
        return existing_member

    member = ProjectMember(
        project_id=project_id,
        user_id=user.id,
        role="participant",
    )

    db.add(member)
    db.commit()
    db.refresh(member)

    return member


def get_project_members(
    db: Session,
    project_id: int,
    user_id: int,
):
    project_data = get_project(
        db=db,
        project_id=project_id,
        user_id=user_id,
    )

    owner = (
        db.query(User)
        .filter(User.id == project_data["owner_id"])
        .first()
    )

    members = (
        db.query(
            ProjectMember.user_id,
            User.email,
            ProjectMember.role,
        )
        .join(
            User,
            User.id == ProjectMember.user_id,
        )
        .filter(ProjectMember.project_id == project_id)
        .all()
    )

    result = [
        {
            "user_id": owner.id,
            "email": owner.email,
            "role": "owner",
        }
    ]

    result.extend(
        {
            "user_id": member.user_id,
            "email": member.email,
            "role": member.role,
        }
        for member in members
    )

    return result
def remove_project_member(
    db: Session,
    project_id: int,
    member_user_id: int,
    owner_id: int,
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

    member = (
        db.query(ProjectMember)
        .filter(
            ProjectMember.project_id == project_id,
            ProjectMember.user_id == member_user_id,
        )
        .first()
    )

    if not member:
        raise ProjectMemberNotFoundException()

    db.delete(member)
    db.commit()


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

    # Save document paths before deleting their DB records.
    documents = (
        db.query(Document)
        .filter(Document.project_id == project_id)
        .all()
    )

    storage_keys = [
        document.storage_key
        for document in documents
    ]

    # Delete child records first because they reference projects
    # through foreign keys.
    db.query(Document).filter(
        Document.project_id == project_id
    ).delete(synchronize_session=False)

    db.query(ProjectMember).filter(
        ProjectMember.project_id == project_id
    ).delete(synchronize_session=False)

    db.flush()

    db.delete(project)
    db.commit()

    # Delete physical files after the database transaction succeeds.
    for storage_key in storage_keys:
        storage_service.delete_file(storage_key)