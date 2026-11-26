import uuid
from datetime import datetime
from typing import Literal

from pydantic import BaseModel, EmailStr


class MemberAdd(BaseModel):
    email: EmailStr
    role: Literal["admin", "member"] = "member"


class MemberRead(BaseModel):
    user_id: uuid.UUID
    name: str
    email: EmailStr
    role: str
    joined_at: datetime