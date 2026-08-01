# Datetime
from datetime import datetime, timedelta, timezone

# JWT
import jwt

# UUID
import uuid

# Application
from core.settings import settings  # Settings

# Secret and Algo
SECRET = settings.secret
ALGORITHM = settings.algorithm


def create_token(user_id: uuid.UUID) -> str:
    expire = datetime.now(timezone.utc) + timedelta(days=7)

    payload = {
        "sub": str(user_id),
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(payload=payload, key=SECRET, algorithm=ALGORITHM)


def create_confirmation_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)

    payload = {
        "sub": email.lower(),
        "type": "email_confirmation",
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(payload=payload, key=SECRET, algorithm=ALGORITHM)


def verify_confirmation_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token,
            key=SECRET,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "sub"]},
        )

        if payload.get("type") != "email_confirmation":
            return None

        return payload.get("sub")
    except (jwt.PyJWTError, KeyError, TypeError):
        return None


def create_reset_password_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=1)

    payload = {
        "sub": email.lower(),
        "type": "reset_password",
        "exp": int(expire.timestamp()),
    }

    return jwt.encode(payload=payload, key=SECRET, algorithm=ALGORITHM)


def verify_reset_password_token(token: str) -> str | None:
    try:
        payload = jwt.decode(
            token,
            key=SECRET,
            algorithms=[ALGORITHM],
            options={"require": ["exp", "sub"]},
        )

        if payload.get("type") != "reset_password":
            return None

        return payload.get("sub")
    except (jwt.PyJWTError, KeyError, TypeError):
        return None
