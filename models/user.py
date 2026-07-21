# SQLAlchemy
from sqlalchemy import Uuid
from sqlalchemy.orm import Mapped, mapped_column, relationship

# UUID
import uuid

# Application
from base import BaseModel  # Base


# User Model
class User(BaseModel):
    __tablename__ = "users"

    # Columns
    id: Mapped[uuid.UUID] = mapped_column(
        Uuid,
        primary_key=True,
        default=uuid.uuid4,
        index=True,
    )
    email: Mapped[str] = mapped_column(
        unique=True,
        nullable=False,
    )
    password: Mapped[str] = mapped_column(
        nullable=False,
    )
    first_name: Mapped[str] = mapped_column(
        nullable=True,
    )
    last_name: Mapped[str] = mapped_column(
        nullable=True,
    )
    is_confirmed: Mapped[bool] = mapped_column(
        nullable=False,
    )
    is_active: Mapped[bool] = mapped_column(
        nullable=False,
    )

    # Relationships
    hosts: Mapped[list["Host"]] = relationship(
        "Host",
        back_populates="user",
    )
    groups: Mapped[list["Group"]] = relationship(
        "Group",
        back_populates="user",
    )
    tags: Mapped[list["Tag"]] = relationship(
        "Tag",
        back_populates="user",
    )
    pages: Mapped[list["Page"]] = relationship(
        "Page",
        back_populates="user",
    )
