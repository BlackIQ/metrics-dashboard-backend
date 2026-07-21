# FastAPI
from fastapi import FastAPI

# Application
from routers import auth, oauth, group, page, tag, user

# FastAPI Application
app = FastAPI(
    title="OpenHubble Metrics - BackEnd",
    version="2.0.0",
    summary="BackEnd service of OpenHubble Metrics.",
    openapi_tags=[
        {"name": "Authentication", "description": "Authentication endpoints"},
        {"name": "OAuthentication", "description": "OAuthentication endpoints"},
        {"name": "Group", "description": "Group endpoints"},
        {"name": "Tag", "description": "Tag endpoints"},
        {"name": "Page", "description": "Page endpoints"},
        {"name": "User", "description": "User endpoints"},
    ],
    servers=[
        {"url": "http://127.0.0.1:8000", "description": "Development"},
        {"url": "https://metrics.openhubble.com/api", "description": "Production"},
    ],
)


# Routers
app.include_router(auth.router, prefix="/api")  # Authentication
app.include_router(oauth.router, prefix="/api")  # OAuthentication
app.include_router(group.router, prefix="/api")  # Group
app.include_router(tag.router, prefix="/api")  # Tag
app.include_router(page.router, prefix="/api")  # Page
app.include_router(user.router, prefix="/api")  # User
