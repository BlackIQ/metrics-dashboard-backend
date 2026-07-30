# FastAPI
from fastapi import APIRouter

# Router
router = APIRouter(
    prefix="/oauth",
    tags=["OAuthentication"],
)


@router.post("/google")
async def google():
    pass
