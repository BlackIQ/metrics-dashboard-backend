# Application
from base import BaseSchema  # Base


# Signin Schema
class SigninSchema(BaseSchema):
    email: str
    password: str


# Signup Schema
class SignupSchema(BaseSchema):
    email: str
    password: str
    first_name: str | None = None
    last_name: str | None = None


# Resend Confirmation Schema
class ResendConfirmationSchema(BaseSchema):
    email: str


# Reset Password Request (Forgot Password)
class ForgotPasswordSchema(BaseSchema):
    email: str


# Reset Password Confirmation
class ResetPasswordSchema(BaseSchema):
    token: str
    new_password: str
    confirm_password: str
