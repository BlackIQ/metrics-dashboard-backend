# Datetime & UUID
from datetime import datetime
from uuid import UUID

# Application
from base import BaseSchema  # Base


# Page Schema
class PageCreate(BaseSchema):
    name: str
    description: str


# Page profile
class PageUpdate(BaseSchema):
    name: str | None = None
    description: str | None = None


# Page email
class PageRead(PageCreate):
    id: UUID

    created_at: datetime
    updated_at: datetime
