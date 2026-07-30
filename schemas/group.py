# Datetime & UUID
from datetime import datetime
from uuid import UUID

# Application
from base import BaseSchema  # Base


# Create Group
class GroupCreate(BaseSchema):
    name: str
    description: str


# Update Group
class GroupUpdate(BaseSchema):
    name: str | None = None
    description: str | None = None


# Read Group
class GroupRead(GroupCreate):
    id: UUID

    created_at: datetime
    updated_at: datetime
