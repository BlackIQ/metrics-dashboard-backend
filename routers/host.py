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
from schemas.host import HostCreate, HostUpdate, HostRead  # Schemas
from models import User, Host, Group, Tag  # Models

# Router
router = APIRouter(
    prefix="/hosts",
    tags=["Host"],
)


@router.get("", response_model=list[HostRead])
async def list_hosts(
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_hosts = (
        db.query(Host)
        .where(
            Host.user_id == user.id,
            Host.deleted_at == None,
        )
        .all()
    )

    return db_hosts


@router.get("/{host_id}", response_model=HostRead)
async def get_host(
    host_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_host = (
        db.query(Host)
        .where(
            Host.id == host_id,
            Host.user_id == user.id,
            Host.deleted_at == None,
        )
        .one_or_none()
    )

    if not db_host:
        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    if db_host.user_id != user.id:
        raise HTTPException(
            status_code=404,
            detail="This host is not yours",
        )

    return db_host


@router.post("", response_model=HostRead)
async def create_host(
    host_data: HostCreate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_group = (
        db.query(Group)
        .where(
            Group.id == host_data.group_id,
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

    db_tags = (
        db.query(Tag)
        .where(
            Tag.id.in_(host_data.tag_ids),
            Tag.user_id == user.id,
            Tag.deleted_at == None,
        )
        .all()
    )

    data = host_data.model_dump(exclude=["ipv4", "tag_ids"])

    db_host = Host(
        **data,
        ipv4=str(host_data.ipv4),
        user_id=user.id,
    )

    db_host.tags = db_tags

    db.add(db_host)
    db.commit()
    db.refresh(db_host)

    return db_host


@router.patch("/{host_id}", response_model=HostRead)
async def update_host(
    host_id: UUID,
    host_data: HostUpdate,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_host = (
        db.query(Host)
        .where(
            Host.id == host_id,
            Host.user_id == user.id,
            Host.deleted_at == None,
        )
        .one_or_none()
    )

    if not db_host:
        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    if db_host.user_id != user.id:
        raise HTTPException(
            status_code=404,
            detail="This host is not yours",
        )

    for key, value in host_data.model_dump(exclude_unset=True).items():
        setattr(db_host, key, value)

    db.commit()
    db.refresh(db_host)

    return db_host


@router.delete("/{host_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_host(
    host_id: UUID,
    user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    db_host = (
        db.query(Host)
        .where(
            Host.id == host_id,
            Host.user_id == user.id,
            Host.deleted_at == None,
        )
        .one_or_none()
    )

    if not db_host:
        raise HTTPException(
            status_code=404,
            detail="Host not found",
        )

    if db_host.user_id != user.id:
        raise HTTPException(
            status_code=404,
            detail="This host is not yours",
        )

    db_host.deleted_at = datetime.now(timezone.utc)

    db.commit()
    db.refresh(db_host)

    return None
