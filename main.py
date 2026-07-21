# FastAPI
from fastapi import FastAPI

# Application
from routers import auth, user

# FastAPI Application
app = FastAPI(
    title="OpenHubble Metrics - BackEnd",
    version="2.0.0",
    summary="BackEnd service of OpenHubble Metrics.",
    openapi_tags=[
        {"name": "Authentication", "description": "OAuth2 Endpoints"},
        {"name": "User", "description": "Manage your account"},
    ],
    servers=[
        {"url": "http://127.0.0.1:8000", "description": "Development"},
        {"url": "https://metrics.openhubble.com/api", "description": "Production"},
    ],
)


# Routers
app.include_router(auth.router, prefix="/api")  # Authentication
app.include_router(user.router, prefix="/api")  # User
