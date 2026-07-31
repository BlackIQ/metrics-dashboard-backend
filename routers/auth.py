# FastAPI
from fastapi import APIRouter, Depends, HTTPException, status, BackgroundTasks

# SQLAlchemy
from sqlalchemy.orm import Session

# Application
from core.settings import settings  # Settings
from dependencies.database import get_db  # Get DB
from security.password import hash_password, verify_password  # Password
from security.token import (
    create_token,
    create_confirmation_token,
    verify_confirmation_token,
    create_reset_password_token,
    verify_reset_password_token,
)  # Token
from schemas.auth import (
    SigninSchema,
    SignupSchema,
    ResendConfirmationSchema,
    ForgotPasswordSchema,
    ResetPasswordSchema,
)  # Schemas
from schemas.common import TokenSchema, MessageSchema  # Schema
from models import User  # Models
from utils.mail import send_email, MailSender  # Email
from utils.mail_templates import (
    get_signup_email,
    get_signin_notification_email,
    get_welcome_email,
    get_forgot_password_email,
    get_password_changed_email,
)  # Mail templates

# Router
router = APIRouter(
    prefix="/auth",
    tags=["Authentication"],
)


@router.post("/signup", response_model=MessageSchema)
async def signup(
    data: SignupSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email_exists = db.query(User).where(User.email == data.email).first()
    if email_exists:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Email already exists",
        )

    user = User(
        email=data.email,
        password=hash_password(data.password),
        first_name=data.first_name,
        last_name=data.last_name,
        is_confirmed=False,
        is_active=False,
    )

    db.add(user)
    db.commit()

    token = create_confirmation_token(user.email)
    confirmation_url = f"{settings.frontend_url}/auth?token={token}"

    background_tasks.add_task(
        send_email,
        sender=MailSender.INFO,
        to=user.email,
        subject="Confirm your OpenHubble account",
        content=get_signup_email(confirmation_url),
    )

    return MessageSchema(
        message="Registration successful. Please check your email to confirm your account."
    )


@router.post("/signin", response_model=TokenSchema)
async def signin(
    data: SigninSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).where(User.email == data.email).first()

    if user is None or user.password is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not verify_password(data.password, user.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password",
        )

    if not user.is_confirmed:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is not confirmed. Please check your email.",
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Account is inactive.",
        )

    access_token = create_token(user.id)

    background_tasks.add_task(
        send_email,
        sender=MailSender.SECURITY,
        to=user.email,
        subject="Security Alert: New Sign-in to OpenHubble",
        content=get_signin_notification_email(),
    )

    return TokenSchema(
        access_token=access_token,
        token_type="bearer",
    )


@router.get("/confirm-email", response_model=MessageSchema)
async def confirm_email(
    token: str,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    email = verify_confirmation_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired confirmation token",
        )

    user = db.query(User).where(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    if user.is_confirmed and user.is_active:
        return MessageSchema(message="Account is already confirmed. Please sign in.")

    user.is_confirmed = True
    user.is_active = True
    db.commit()

    background_tasks.add_task(
        send_email,
        sender=MailSender.INFO,
        to=user.email,
        subject="Welcome to OpenHubble!",
        content=get_welcome_email(),
    )

    return MessageSchema(
        message="Your email has been confirmed and account activated. Please sign in."
    )


@router.post("/resend-confirmation", response_model=MessageSchema)
async def resend_confirmation(
    data: ResendConfirmationSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).where(User.email == data.email).first()

    generic_msg = MessageSchema(
        message="If this email is registered and unconfirmed, a confirmation link has been sent."
    )

    if not user:
        return generic_msg

    if user.is_confirmed and user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This account is already confirmed.",
        )

    token = create_confirmation_token(user.email)
    confirmation_url = f"{settings.frontend_url}/auth?token={token}"

    background_tasks.add_task(
        send_email,
        sender=MailSender.INFO,
        to=user.email,
        subject="Confirm your OpenHubble account",
        content=get_signup_email(confirmation_url),
    )

    return generic_msg


@router.post("/forgot-password", response_model=MessageSchema)
async def forgot_password(
    data: ForgotPasswordSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    user = db.query(User).where(User.email == data.email).first()

    generic_msg = MessageSchema(
        message="If this email is registered, password reset instructions have been sent."
    )

    if not user:
        return generic_msg

    token = create_reset_password_token(user.email)
    reset_url = f"{settings.frontend_url}/auth?reset_token={token}"

    background_tasks.add_task(
        send_email,
        sender=MailSender.SECURITY,
        to=user.email,
        subject="Reset your OpenHubble Password",
        content=get_forgot_password_email(reset_url),
    )

    return generic_msg


@router.post("/reset-password", response_model=MessageSchema)
async def reset_password(
    data: ResetPasswordSchema,
    background_tasks: BackgroundTasks,
    db: Session = Depends(get_db),
):
    if data.new_password != data.confirm_password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Passwords do not match.",
        )

    email = verify_reset_password_token(data.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token.",
        )

    user = db.query(User).where(User.email == email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found.",
        )

    user.password = hash_password(data.new_password)
    db.commit()

    background_tasks.add_task(
        send_email,
        sender=MailSender.SECURITY,
        to=user.email,
        subject="Your OpenHubble password has been changed",
        content=get_password_changed_email(),
    )

    return MessageSchema(
        message="Password has been reset successfully. Please sign in with your new password."
    )
