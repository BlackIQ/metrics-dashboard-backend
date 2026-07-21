# Datetime & UUID
from datetime import datetime
from uuid import UUID

# Application
from base import BaseSchema  # Base


# Tag Schema
class TagCreate(BaseSchema):
    name: str
    description: str


# Tag profile
class TagUpdate(BaseSchema):
    name: str | None = None
    description: str | None = None


# Tag email
class TagRead(TagCreate):
    id: UUID

    created_at: datetime
    updated_at: datetime
