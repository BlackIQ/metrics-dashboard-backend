# HMAC
import hmac

# FastAPI
from fastapi import status, Security, HTTPException
from fastapi.security import APIKeyHeader

# Application
from core.settings import settings  # Settings

# API Key Schema
apikey_schema = APIKeyHeader(name="X-API-KEY", description="API Key in header")


# API-KEY Dependency
async def apikey(api_key: str = Security(apikey_schema)):
    if not api_key:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing API key"
        )

    if not hmac.compare_digest(api_key, settings.secret):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid API key"
        )

    return api_key
