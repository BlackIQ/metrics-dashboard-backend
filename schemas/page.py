# Datetime & UUID
from datetime import datetime
from uuid import UUID

# Application
from base import BaseSchema  # Base


# Create Page
class PageCreate(BaseSchema):
    name: str
    description: str


# Update Page
class PageUpdate(BaseSchema):
    name: str | None = None
    description: str | None = None


# Read Page
class PageRead(PageCreate):
    id: UUID

    created_at: datetime
    updated_at: datetime
