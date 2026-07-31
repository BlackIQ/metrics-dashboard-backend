# FastAPI
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks

# SQLAlchemy
from sqlalchemy import and_, or_
from sqlalchemy.orm import Session

# Firebase
from firebase_admin import auth as firebase_auth

# Application
import core.firebase  # Firebase
from dependencies.database import get_db  # Get DB
from security.token import create_token  # Token
from schemas.oauth import OAuthSchema  # Schemas
from schemas.common import TokenSchema  # Schema
from models import User  # Models
from utils.mail import send_email, MailSender  # Email
from utils.mail_templates import (
    get_signin_notification_email,
    get_welcome_email,
)  # Mail templates

# Router
router = APIRouter(
    prefix="/oauth",
    tags=["OAuthentication"],
)


@router.post("/google", response_model=TokenSchema)
async def google_login(
    payload: OAuthSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        decoded_token = firebase_auth.verify_id_token(payload.id_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        )

    uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by Google account",
        )

    name_parts = name.split(" ") if name else ["", ""]
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

    user = (
        db.query(User)
        .filter(
            or_(
                and_(
                    User.oauth_id == uid,
                    User.oauth_provider == "google",
                ),
                User.email == email,
            )
        )
        .first()
    )

    is_new_user = False

    if not user:
        is_new_user = True
        user = User(
            email=email,
            password=None,
            first_name=first_name,
            last_name=last_name,
            is_confirmed=True,
            is_active=True,
            oauth_provider="google",
            oauth_id=uid,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    elif not user.oauth_provider:
        user.oauth_provider = "google"
        user.oauth_id = uid
        user.is_confirmed = True

        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    if is_new_user:
        background_tasks.add_task(
            send_email,
            sender=MailSender.INFO,
            to=user.email,
            subject="Welcome to OpenHubble!",
            content=get_welcome_email(),
        )
    else:
        background_tasks.add_task(
            send_email,
            sender=MailSender.SECURITY,
            to=user.email,
            subject="Security Alert: New Sign-in to OpenHubble",
            content=get_signin_notification_email(),
        )

    access_token = create_token(user.id)

    return TokenSchema(
        access_token=access_token,
        token_type="bearer",
    )


@router.post("/facebook", response_model=TokenSchema)
async def facebook_login(
    payload: OAuthSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        decoded_token = firebase_auth.verify_id_token(payload.id_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        )

    uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by Facebook account",
        )

    name_parts = name.split(" ") if name else ["", ""]
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

    user = (
        db.query(User)
        .filter(
            or_(
                and_(
                    User.oauth_id == uid,
                    User.oauth_provider == "facebook",
                ),
                User.email == email,
            )
        )
        .first()
    )

    is_new_user = False

    if not user:
        is_new_user = True
        user = User(
            email=email,
            password=None,
            first_name=first_name,
            last_name=last_name,
            is_confirmed=True,
            is_active=True,
            oauth_provider="facebook",
            oauth_id=uid,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    elif not user.oauth_provider:
        user.oauth_provider = "facebook"
        user.oauth_id = uid
        user.is_confirmed = True

        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    if is_new_user:
        background_tasks.add_task(
            send_email,
            sender=MailSender.INFO,
            to=user.email,
            subject="Welcome to OpenHubble!",
            content=get_welcome_email(),
        )
    else:
        background_tasks.add_task(
            send_email,
            sender=MailSender.SECURITY,
            to=user.email,
            subject="Security Alert: New Sign-in to OpenHubble",
            content=get_signin_notification_email(),
        )

    access_token = create_token(user.id)

    return TokenSchema(
        access_token=access_token,
        token_type="bearer",
    )


@router.post("/github", response_model=TokenSchema)
async def github_login(
    payload: OAuthSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    try:
        decoded_token = firebase_auth.verify_id_token(payload.id_token)
    except Exception:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        )

    uid = decoded_token.get("uid")
    email = decoded_token.get("email")
    name = decoded_token.get("name", "")

    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email not provided by GitHub account",
        )

    name_parts = name.split(" ") if name else ["", ""]
    first_name = name_parts[0]
    last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

    user = (
        db.query(User)
        .filter(
            or_(
                and_(
                    User.oauth_id == uid,
                    User.oauth_provider == "github",
                ),
                User.email == email,
            )
        )
        .first()
    )

    is_new_user = False

    if not user:
        is_new_user = True
        user = User(
            email=email,
            password=None,
            first_name=first_name,
            last_name=last_name,
            is_confirmed=True,
            is_active=True,
            oauth_provider="github",
            oauth_id=uid,
        )

        db.add(user)
        db.commit()
        db.refresh(user)

    elif not user.oauth_provider:
        user.oauth_provider = "github"
        user.oauth_id = uid
        user.is_confirmed = True

        db.commit()
        db.refresh(user)

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Account is inactive",
        )

    if is_new_user:
        background_tasks.add_task(
            send_email,
            sender=MailSender.INFO,
            to=user.email,
            subject="Welcome to OpenHubble!",
            content=get_welcome_email(),
        )
    else:
        background_tasks.add_task(
            send_email,
            sender=MailSender.SECURITY,
            to=user.email,
            subject="Security Alert: New Sign-in to OpenHubble",
            content=get_signin_notification_email(),
        )

    access_token = create_token(user.id)

    return TokenSchema(
        access_token=access_token,
        token_type="bearer",
    )
