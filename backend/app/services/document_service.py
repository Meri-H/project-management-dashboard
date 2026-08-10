from fastapi import UploadFile
from sqlalchemy.orm import Session

from backend.app.models.document import Document
from backend.app.services import storage_service
from backend.app.services import project_service


def upload_document(
    db: Session,
    project_id: int,
    user_id: int,
    file: UploadFile,
):
    project_service.get_project(
        db=db,
        project_id=project_id,
        user_id=user_id,
    )

    file_bytes = file.file.read()

    storage_key = storage_service.save_file(
        file_bytes=file_bytes,
        filename=file.filename,
        project_id=project_id,
    )

    document = Document(
        project_id=project_id,
        filename=file.filename,
        storage_key=storage_key,
        content_type=file.content_type or "application/octet-stream",
        size=len(file_bytes),
    )

    db.add(document)
    db.commit()
    db.refresh(document)

    return document

def get_project_documents(
    db: Session,
    project_id: int,
    user_id: int,
):
    project_service.get_project(
        db=db,
        project_id=project_id,
        user_id=user_id,
    )

    return (
        db.query(Document)
        .filter(Document.project_id == project_id)
        .all()
    )

from backend.app.core.exceptions import ProjectNotFoundException


def get_document(
    db: Session,
    document_id: int,
    user_id: int,
):
    document = (
        db.query(Document)
        .filter(Document.id == document_id)
        .first()
    )

    if not document:
        raise ProjectNotFoundException()

    project_service.get_project(
        db=db,
        project_id=document.project_id,
        user_id=user_id,
    )

    return document

def update_document(
    db: Session,
    document_id: int,
    user_id: int,
    file: UploadFile,
):
    document = get_document(
        db=db,
        document_id=document_id,
        user_id=user_id,
    )

    old_storage_key = document.storage_key

    file_bytes = file.file.read()

    new_storage_key = storage_service.save_file(
        file_bytes=file_bytes,
        filename=file.filename,
        project_id=document.project_id,
    )

    document.filename = file.filename
    document.storage_key = new_storage_key
    document.content_type = file.content_type or "application/octet-stream"
    document.size = len(file_bytes)

    db.commit()
    db.refresh(document)

    storage_service.delete_file(old_storage_key)

    return document

def delete_document(
    db: Session,
    document_id: int,
    user_id: int,
):
    document = get_document(
        db=db,
        document_id=document_id,
        user_id=user_id,
    )

    storage_key = document.storage_key

    db.delete(document)
    db.commit()

    storage_service.delete_file(storage_key)