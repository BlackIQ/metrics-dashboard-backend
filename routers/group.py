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
from schemas.group import GroupCreate, GroupUpdate, GroupRead  # Schemas
from models import User, Group  # Models

# Router
router = APIRouter(
    prefix="/groups",
    tags=["Group"],
)


@router.get("", response_model=list[GroupRead])
async def list_groups(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_groups = (
        db.query(Group)
        .where(
            Group.user_id == user.id,
            Group.deleted_at == None,
        )
        .all()
    )

    return db_groups


@router.get("/{group_id}", response_model=GroupRead)
async def get_group(
    group_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_group = (
        db.query(Group)
        .where(
            Group.id == group_id,
            Group.user_id == user.id,
            Group.deleted_at == None,
        )
        .one_or_none()
    )

    if not db_group:
        raise HTTPException(
            status_code=404,
            detail="Group not found",
        )

    if db_group.user_id != user.id:
        raise HTTPException(
            status_code=404,
            detail="This group is not yours",
        )

    return db_group


@router.post("", response_model=GroupRead)
async def create_group(
    group_data: GroupCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_group = Group(**group_data.model_dump(), user_id=user.id)

    db.add(db_group)
    db.commit()
    db.refresh(db_group)

    return db_group


@router.patch("/{group_id}", response_model=GroupRead)
async def update_group(
    group_id: UUID,
    group_data: GroupUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_group = (
        db.query(Group)
        .where(
            Group.id == group_id,
            Group.user_id == user.id,
            Group.deleted_at == None,
        )
        .one_or_none()
    )

    if not db_group:
        raise HTTPException(
            status_code=404,
            detail="Group not found",
        )

    if db_group.user_id != user.id:
        raise HTTPException(
            status_code=404,
            detail="This group is not yours",
        )

    for key, value in group_data.model_dump(exclude_unset=True).items():
        setattr(db_group, key, value)

    db.commit()
    db.refresh(db_group)

    return db_group


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_group(
    group_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_group = (
        db.query(Group)
        .where(
            Group.id == group_id,
            Group.user_id == user.id,
            Group.deleted_at == None,
        )
        .one_or_none()
    )

    if not db_group:
        raise HTTPException(
            status_code=404,
            detail="Group not found",
        )

    if db_group.user_id != user.id:
        raise HTTPException(
            status_code=404,
            detail="This group is not yours",
        )

    db_group.deleted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_group)

    return None
