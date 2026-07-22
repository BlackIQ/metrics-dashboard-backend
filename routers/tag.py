# FastAPI
from fastapi import APIRouter, Depends, HTTPException, status

# SQLAlchemy
from sqlalchemy.orm import Session

# Datetime
from datetime import datetime, timezone

# UUID
from uuid import UUID

# Application
from dependencies.database import get_db  # Get DB
from dependencies.token import get_current_user  # Get current user
from schemas.tag import TagCreate, TagUpdate, TagRead  # Schemas
from models import User, Tag

# Router
router = APIRouter(
    prefix="/tags",
    tags=["Tag"],
)


@router.get("", response_model=list[TagRead])
async def list_tags(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_tags = (
        db.query(Tag)
        .where(
            Tag.user_id == user.id,
        )
        .all()
    )

    return db_tags


@router.get("/{tag_id}", response_model=TagRead)
async def get_tag(
    tag_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    tag = db.get(Tag, tag_id)

    if not tag:
        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )

    if tag.user_id is not user.id:
        raise HTTPException(
            status_code=404,
            detail="This tag is not yours",
        )

    return tag


@router.post("", response_model=TagRead)
async def create_tag(
    tag_data: TagCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_tag = Tag(**tag_data.model_dump(), user_id=user.id)

    db.add(db_tag)
    db.commit()
    db.refresh(db_tag)

    return db_tag


@router.patch("/{tag_id}", response_model=TagRead)
async def update_tag(
    tag_id: UUID,
    tag_data: TagUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_tag = db.get(Tag, tag_id)

    if not db_tag:
        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )

    if db_tag.user_id is not user.id:
        raise HTTPException(
            status_code=404,
            detail="This tag is not yours",
        )

    for key, value in tag_data.model_dump(exclude_unset=True).items():
        setattr(db_tag, key, value)

    db.commit()
    db.refresh(db_tag)

    return db_tag


@router.delete("/{tag_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_tag(
    tag_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_tag = db.get(Tag, tag_id)

    if not db_tag:
        raise HTTPException(
            status_code=404,
            detail="Tag not found",
        )

    if db_tag.user_id is not user.id:
        raise HTTPException(
            status_code=404,
            detail="This tag is not yours",
        )

    db_tag.deleted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_tag)

    return None
