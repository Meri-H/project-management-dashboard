from datetime import datetime
from pydantic import BaseModel, ConfigDict, Field

class UserResponse(BaseModel):
    id: int
    email: str
    full_name: str
    is_active: bool
    created_at: datetime
    updated_at: datetime

    model_config = ConfigDict(from_attributes=True)

class UserRegister(BaseModel):
    login: str
    password: str = Field(min_length=8)
    repeat_password: str = Field(min_length=8)

class UserLogin(BaseModel):
    login: str
    password: str