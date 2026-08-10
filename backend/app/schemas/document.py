from datetime import datetime

from pydantic import BaseModel, ConfigDict


class DocumentResponse(BaseModel):
    id: int
    project_id: int
    filename: str
    content_type: str
    size: int
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)