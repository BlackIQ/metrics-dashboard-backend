# FastAPI
from fastapi import APIRouter, Depends, HTTPException, status

# SQLAlchemy
from sqlalchemy.orm import Session

# Firebase
from firebase_admin import auth as firebase_auth

# Application
import core.firebase  # Firebase
from dependencies.database import get_db  # Get DB
from security.password import hash_password, verify_password  # Password
from security.token import create_token  # Token
from schemas.auth import TokenSchema  # Schema
from schemas.oauth import OAuthSchema  # Schemas
from models import User  # Models

# Router
router = APIRouter(
    prefix="/oauth",
    tags=["OAuthentication"],
)


@router.post("/google", response_model=TokenSchema)
async def google_login(
    payload: OAuthSchema,
    db: Session = Depends(get_db),
):
    print(payload)

    try:
        decoded_token = firebase_auth.verify_id_token(payload.id_token)
    except Exception as e:
        print(e)

        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired Firebase ID token",
        )

    print("==============")

    print(decoded_token)

    # uid = decoded_token.get("uid")
    # email = decoded_token.get("email")
    # name = decoded_token.get("name", "")

    # if not email:
    #     raise HTTPException(
    #         status_code=status.HTTP_400_BAD_REQUEST,
    #         detail="Email not provided by Google account",
    #     )

    # name_parts = name.split(" ") if name else ["", ""]
    # first_name = name_parts[0]
    # last_name = " ".join(name_parts[1:]) if len(name_parts) > 1 else ""

    # 3. Find existing user by (oauth_id + provider) OR email
    # user = db.query(User).filter((User.email == email) | ((User.oauth_id == uid) & (User.oauth_provider == "google"))).first()

    # If user doesn't exist -> Create User
    # If user exists but no oauth_provider -> Link Account (update oauth_provider="google", oauth_id=uid)

    # 4. Generate your internal JWT Access Token
    # access_token = create_access_token(data={"sub": str(user.id)})

    return TokenSchema(
        access_token="",
        token_type="bearer",
    )
