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
        "exp": expire,
    }

    jwt_token = jwt.encode(payload=payload, key=SECRET, algorithm=ALGORITHM)

    return jwt_token


def create_confirmation_token(email: str) -> str:
    expire = datetime.now(timezone.utc) + timedelta(hours=24)

    payload = {
        "sub": email,
        "type": "email_confirmation",
        "exp": expire,
    }

    return jwt.encode(payload=payload, key=SECRET, algorithm=ALGORITHM)


def verify_confirmation_token(token: str) -> str | None:
    try:
        payload = jwt.decode(token, key=SECRET, algorithms=[ALGORITHM])

        if payload.get("type") != "email_confirmation":
            return None

        return payload.get("sub")
    except (jwt.PyJWTError, KeyError):
        return None
