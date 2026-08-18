from io import BytesIO
from urllib.parse import quote

from fastapi import APIRouter, Depends, File, Response, UploadFile, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session

from backend.app.core.security import get_current_user
from backend.app.db.dependencies import get_db
from backend.app.models.user import User
from backend.app.schemas.document import DocumentResponse
from backend.app.services import document_service, storage_service


router = APIRouter(tags=["Documents"])


@router.post(
    "/projects/{project_id}/documents",
    response_model=DocumentResponse,
)
def upload_document(
    project_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return document_service.upload_document(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
        file=file,
    )


@router.get(
    "/projects/{project_id}/documents",
    response_model=list[DocumentResponse],
)
def get_project_documents(
    project_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return document_service.get_project_documents(
        db=db,
        project_id=project_id,
        user_id=current_user.id,
    )


@router.get("/documents/{document_id}")
def download_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document = document_service.get_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    file_bytes = storage_service.read_file(
        document.storage_key
    )

    encoded_filename = quote(document.filename)

    return StreamingResponse(
        BytesIO(file_bytes),
        media_type=document.content_type,
        headers={
            "Content-Disposition": (
                f"attachment; filename*=UTF-8''{encoded_filename}"
            )
        },
    )


@router.put(
    "/documents/{document_id}",
    response_model=DocumentResponse,
)
def update_document(
    document_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return document_service.update_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
        file=file,
    )


@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    document_service.delete_document(
        db=db,
        document_id=document_id,
        user_id=current_user.id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)