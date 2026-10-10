
from uuid import uuid4

from fastapi import APIRouter, HTTPException

from app.schemas.activity import (
    ActivityRequest,
    FieldActivity,
    FieldSession,
    Observation,
    DebriefResponse,
    DebriefRequest,
)
from app.services.ai_service import generate_activity, generate_debrief

router = APIRouter(prefix="/api/sessions", tags=["Sessions"])

# Temporary in-memory storage for the MVP.
sessions: dict[str, FieldSession] = {}


@router.post("", response_model=dict)
async def create_session(request: ActivityRequest):
    activity = await generate_activity(request)
    session_id = str(uuid4())

    sessions[session_id] = FieldSession(activity=activity)

    return {
        "session_id": session_id,
        "activity": activity,
    }


@router.post("/{session_id}/observations")
async def add_observation(session_id: str, observation: Observation):
    session = sessions.get(session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    if len(session.observations) >= session.activity.observations_required:
        raise HTTPException(
            status_code=400,
            detail="All required observations have been submitted",
        )

    session.observations.append(observation)

    return {
        "message": "Observation recorded",
        "observations_count": len(session.observations),
        "observations_required": session.activity.observations_required,
    }


@router.get("/{session_id}", response_model=FieldSession)
async def get_session(session_id: str):
    session = sessions.get(session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return session


@router.post("/{session_id}/debrief", response_model=DebriefResponse)
async def create_debrief(
    session_id: str,
    request: DebriefRequest,
):
    session = sessions.get(session_id)

    if session is None:
        raise HTTPException(
            status_code=404,
            detail="Session not found",
        )

    if not session.observations:
        raise HTTPException(
            status_code=400,
            detail="Submit at least one observation before requesting a debrief",
        )

    observations = [
        observation.content for observation in session.observations
    ]

    return await generate_debrief(
        activity=session.activity,
        observations=observations,
        request=request,
    )