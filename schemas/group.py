# Datetime & UUID
from datetime import datetime
from uuid import UUID

# Application
from base import BaseSchema  # Base


# Group Schema
class GroupCreate(BaseSchema):
    name: str
    description: str


# Group profile
class GroupUpdate(BaseSchema):
    name: str | None = None
    description: str | None = None


# Group email
class GroupRead(GroupCreate):
    id: UUID

    created_at: datetime
    updated_at: datetime
