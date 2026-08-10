from fastapi import APIRouter, Depends, File, UploadFile
from sqlalchemy.orm import Session

from backend.app.db.dependencies import get_db
from backend.app.schemas.document import DocumentResponse
from backend.app.services import document_service
from fastapi.responses import FileResponse
from fastapi import Response, status


router = APIRouter(tags=["Documents"])


@router.post(
    "/projects/{project_id}/documents",
    response_model=DocumentResponse,
)
def upload_document(
    project_id: int,
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return document_service.upload_document(
        db=db,
        project_id=project_id,
        user_id=user_id,
        file=file,
    )

@router.get(
    "/projects/{project_id}/documents",
    response_model=list[DocumentResponse],
)
def get_project_documents(
    project_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    return document_service.get_project_documents(
        db=db,
        project_id=project_id,
        user_id=user_id,
    )
@router.get("/documents/{document_id}")
def download_document(
    document_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    document = document_service.get_document(
        db=db,
        document_id=document_id,
        user_id=user_id,
    )

    return FileResponse(
        path=document.storage_key,
        filename=document.filename,
        media_type=document.content_type,
    )

@router.put(
    "/documents/{document_id}",
    response_model=DocumentResponse,
)
def update_document(
    document_id: int,
    user_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
):
    return document_service.update_document(
        db=db,
        document_id=document_id,
        user_id=user_id,
        file=file,
    )
@router.delete(
    "/documents/{document_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_document(
    document_id: int,
    user_id: int,
    db: Session = Depends(get_db),
):
    document_service.delete_document(
        db=db,
        document_id=document_id,
        user_id=user_id,
    )

    return Response(status_code=status.HTTP_204_NO_CONTENT)