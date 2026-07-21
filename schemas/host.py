# Datetime & UUID
from datetime import datetime
from uuid import UUID

# Pydantic
from pydantic.networks import IPvAnyAddress

# Application
from base import BaseSchema  # Base
from enums import Communication  # Enums


# Host Schema
class HostCreate(BaseSchema):
    name: str
    description: str
    ipv4: IPvAnyAddress
    ipv6: IPvAnyAddress
    dns: str
    port: int
    api_key: str
    communication: Communication
    is_active: bool


# Host profile
class HostUpdate(BaseSchema):
    name: str | None = None
    description: str | None = None
    ipv4: IPvAnyAddress | None = None
    ipv6: IPvAnyAddress | None = None
    dns: str | None = None
    port: int | None = None
    api_key: str | None = None
    communication: Communication | None = None
    is_active: bool | None = None


# Host email
class HostRead(HostCreate):
    id: UUID

    agent_availability: bool

    created_at: datetime
    updated_at: datetime
