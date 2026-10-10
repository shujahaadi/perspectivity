import asyncio
import json
import os
from pathlib import Path

from dotenv import load_dotenv
from google import genai

from app.schemas.activity import ActivityRequest, FieldActivity, DebriefRequest, DebriefResponse

# Resolve the repository root and load its .env file.
ROOT_DIR = Path(__file__).resolve().parents[3]
ENV_PATH = ROOT_DIR / ".env"

load_dotenv(ENV_PATH, override=True)

API_KEY = os.getenv("GEMINI_API_KEY")
client = genai.Client(api_key=API_KEY) if API_KEY else None

MODEL = "gemma-4-26b-a4b-it"



async def generate_activity(request: ActivityRequest) -> FieldActivity:
    if client is None:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Add it to the repository root .env file."
        )

    prompt = f"""
You are the activity designer for Perspectivity, an AI-powered
real-world observation and reasoning experience.

Create one engaging, safe, practical outdoor field activity.

User's available time: {request.duration} minutes.
User's experience level: {request.experience}.

Design principles:
- The user should put their phone away during observation.
- Do not require photographs, purchases, or special equipment.
- Encourage noticing overlooked details in the surrounding environment.
- Make the user form a hypothesis from observations, not just collect facts.
- Keep the activity appropriate for the user's experience level.
- Respect private property, personal boundaries, and public safety.
- The mission must fit within the available time.

Return ONLY valid JSON with exactly these fields:
{{
  "title": "Short, engaging activity title",
  "role": "The role the user will play",
  "question": "The central question to investigate",
  "mission": "Clear instructions for the field investigation",
  "rules": ["Rule 1", "Rule 2"],
  "observations_required": 3
}}

Set observations_required to an integer between 1 and 10.
Do not wrap the JSON in Markdown fences.
"""

    def call_gemma():
        return client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )

    response = await asyncio.to_thread(call_gemma)
    raw_text = response.text

    if not raw_text:
        raise ValueError("Gemma returned an empty response.")

    # Be tolerant if the model accidentally wraps its JSON in Markdown.
    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```json").removeprefix("```")
        cleaned = cleaned.removesuffix("```").strip()

    activity_data = json.loads(cleaned)
    return FieldActivity.model_validate(activity_data)


async def generate_debrief(
    activity: FieldActivity,
    observations: list[str],
    request: DebriefRequest,
) -> DebriefResponse:
    if client is None:
        raise RuntimeError(
            "GEMINI_API_KEY is missing. Check your repository root .env file."
        )

    observations_text = "\n".join(
        f"- {observation}" for observation in observations
    )

    prompt = f"""
You are Perspectivity's field investigation mentor.

Help the user improve their observation and reasoning skills.
Do not simply declare their hypothesis right or wrong.

ACTIVITY:
Title: {activity.title}
Research question: {activity.question}
Mission: {activity.mission}

USER OBSERVATIONS:
{observations_text}

USER HYPOTHESIS:
{request.hypothesis}

Return ONLY valid JSON with exactly these fields:
{{
  "summary": "Balanced assessment of the hypothesis",
  "evidence": ["Specific evidence from the observations"],
  "assumptions": ["Claims that need further evidence"],
  "next_steps": ["Practical follow-up observations"],
  "reflection_question": "One question that encourages deeper reasoning"
}}

Ground your response in the supplied observations.
Never invent observations or claim certainty without evidence.
Be constructive, specific, and concise.
Do not wrap the JSON in Markdown fences.
"""

    def call_gemma():
        return client.models.generate_content(
            model=MODEL,
            contents=prompt,
        )

    response = await asyncio.to_thread(call_gemma)
    raw_text = response.text

    if not raw_text:
        raise ValueError("Gemma returned an empty debrief.")

    cleaned = raw_text.strip()
    if cleaned.startswith("```"):
        cleaned = cleaned.removeprefix("```json").removeprefix("```")
        cleaned = cleaned.removesuffix("```").strip()

    debrief_data = json.loads(cleaned)
    return DebriefResponse.model_validate(debrief_data)