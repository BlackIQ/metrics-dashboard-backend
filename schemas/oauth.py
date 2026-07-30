# Application
from base import BaseSchema  # Base


# OAuth Schema
class OAuthSchema(BaseSchema):
    id_token: str
