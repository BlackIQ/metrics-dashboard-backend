# SQLAlchemy
from sqlalchemy import Uuid, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship

# UUID
import uuid

# Application
from base import BaseModel  # Base


# Tag Model
class Tag(BaseModel):
    __tablename__ = "tags"

    # Columns
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    name: Mapped[str] = mapped_column(
        nullable=False,
    )
    description: Mapped[str] = mapped_column(
        nullable=False,
    )

    # Foreign Keys
    user_id: Mapped[uuid.UUID] = mapped_column(
        ForeignKey("users.id"),
        index=True,
        nullable=False,
    )

    # Relationships
    user: Mapped["User"] = relationship(
        "User",
        back_populates="tags",
    )
    hosts: Mapped[list["HostTag"]] = relationship(
        "HostTag",
        back_populates="tag",
    )
