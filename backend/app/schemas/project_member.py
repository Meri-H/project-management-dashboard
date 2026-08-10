from pydantic import BaseModel


class ProjectMemberResponse(BaseModel):
    user_id: int
    email: str
    role: str