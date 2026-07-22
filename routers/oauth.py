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


@router.post("/microsoft")
async def microsoft():
    pass


@router.post("/facebook")
async def facebook():
    pass
