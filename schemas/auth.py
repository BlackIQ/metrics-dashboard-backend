# Regex
import re

# Pydantic
from pydantic import ConfigDict, field_validator

# Application
from base import BaseSchema  # Base
from security.password import validate_password_strength  # Password


# Base Auth Schema
class BaseAuthSchema(BaseSchema):
    model_config = ConfigDict(from_attributes=True, str_strip_whitespace=True)

    @field_validator("email", mode="before")
    @classmethod
    def normalize_email(cls, value: str):
        return value.strip().lower()

    @field_validator("email")
    @classmethod
    def validate_email(cls, value: str) -> str:
        if not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", value):
            raise ValueError("Email must be a valid email address")

        return value

    @field_validator("password")
    @classmethod
    def validate_password(cls, value: str) -> str:
        if not validate_password_strength(value):
            raise ValueError(
                "Password must be at least 12 characters and include uppercase, lowercase, digit, and special character"
            )

        return value


# Signin Schema
class SigninSchema(BaseAuthSchema):
    email: str
    password: str


# Signup Schema
class SignupSchema(BaseAuthSchema):
    email: str
    password: str
    first_name: str | None = None
    last_name: str | None = None


# Resend Confirmation Schema
class ResendConfirmationSchema(BaseAuthSchema):
    email: str


# Reset Password Request Schema
class ForgotPasswordSchema(BaseAuthSchema):
    email: str


# Reset Password Confirmation Schema
class ResetPasswordSchema(BaseAuthSchema):
    token: str
    new_password: str
    confirm_password: str
