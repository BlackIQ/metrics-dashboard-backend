# SQLAlchemy
from sqlalchemy import ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

# UUID
import uuid

# Application
from base import BaseModel  # Base


# Host - Tag Model
class HostTag(BaseModel):
    __tablename__ = "host_tags"

    # Foreign Keys
    host_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("hosts.id"),
        primary_key=True,
    )
    tag_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("tags.id"),
        primary_key=True,
    )
