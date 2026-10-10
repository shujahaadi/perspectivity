from fastapi import APIRouter

from app.schemas.activity import ActivityRequest, FieldActivity
from app.services.ai_service import generate_activity


router = APIRouter(
    prefix="/api/activities",
    tags=["Activities"]
)


@router.post("/generate", response_model=FieldActivity)
async def create_activity(request: ActivityRequest):
    return await generate_activity(request)