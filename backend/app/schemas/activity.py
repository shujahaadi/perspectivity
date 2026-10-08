from pydantic import BaseModel, Field


class ActivityRequest(BaseModel):
    duration: int = Field(
        ge=10,
        le=60,
        description="Available time in minutes"
    )
    experience: str = Field(
        description="User's experience level"
    )


class FieldActivity(BaseModel):
    title: str
    role: str
    question: str
    mission: str
    rules: list[str]
    observations_required: int = Field(ge=1)