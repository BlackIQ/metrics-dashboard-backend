# Datetime & UUID
from datetime import datetime
from uuid import UUID

# Application
from base import BaseSchema  # Base


# Profile Schema
class UserProfileSchema(BaseSchema):
    id: UUID
    email: str
    first_name: str | None = None
    last_name: str | None = None
    created_at: datetime
    updated_at: datetime


# Change Profile
class ChangeProfileSchema(BaseSchema):
    first_name: str | None = None
    last_name: str | None = None


# Change Email
class ChangeEmailSchema(BaseSchema):
    email: str


# Change Password
class ChangePasswordSchema(BaseSchema):
    current_password: str
    new_password: str
    confirm_password: str
