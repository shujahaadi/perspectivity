from typing import Literal

from pydantic import BaseModel, Field


class ActivityRequest(BaseModel):
    duration: int = Field(
        ge=10,
        le=60,
        description="Available time in minutes"
    )
    experience: Literal[
        "curious",
        "explorer",
        "researcher"
    ] = Field(
        description="User's experience level"
    )


class Observation(BaseModel):
    content: str = Field(
        min_length=1,
        max_length=1000,
        description="What the user observed in the field"
    )


class FieldActivity(BaseModel):
    title: str
    role: str
    question: str
    mission: str
    rules: list[str]
    observations_required: int = Field(
        ge=1,
        le=10
    )


class FieldSession(BaseModel):
    activity: FieldActivity
    observations: list[Observation] = []