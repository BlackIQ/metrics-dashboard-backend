# Datetime & UUID
from datetime import datetime
from uuid import UUID

# Application
from base import BaseSchema  # Base


# Create Tag
class TagCreate(BaseSchema):
    name: str
    description: str


# Update Tag
class TagUpdate(BaseSchema):
    name: str | None = None
    description: str | None = None


# Read Tag
class TagRead(TagCreate):
    id: UUID

    created_at: datetime
    updated_at: datetime
