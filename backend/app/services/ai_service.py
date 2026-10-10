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

Your goal is to teach observation, critical thinking, and hypothesis testing.
Help the user reason independently. Do not simply declare their hypothesis
right or wrong.

ACTIVITY:
Title: {activity.title}
Research question: {activity.question}
Mission: {activity.mission}

USER OBSERVATIONS:
{observations_text}

USER HYPOTHESIS:
{request.hypothesis}

CRITICAL REASONING RULES

1. EVIDENCE MUST COME FROM THE USER
- Use only the supplied activity, observations, and hypothesis.
- Never invent observations, environmental conditions, or evidence.
- Do not claim the user observed something unless it appears in their notes.
- If evidence is insufficient, explicitly acknowledge the uncertainty.
- If a note is vague or incomplete, treat it as vague or incomplete.
  Do not fill in missing details yourself.

2. DISTINGUISH OBSERVATIONS FROM ASSUMPTIONS
- Evidence: identify what the recorded observations actually support.
- Assumptions: identify explanations that lack sufficient evidence.
- Distinguish direct observations from interpretations.
- Do not confuse correlation with causation.
- A plausible explanation is not a proven explanation.

3. EVALUATE THE HYPOTHESIS FAIRLY
- Explain which parts are supported, uncertain, or unsupported.
- Do not automatically reject the user's hypothesis.
- Consider alternative explanations when relevant.
- If the hypothesis contains several possible causes, help isolate them.
- Never present speculation as an established fact.


4. RECOMMEND USEFUL INVESTIGATIONS
- Suggest specific, safe, practical follow-up observations.
- Each next step should help distinguish between competing explanations.
- For every suggested investigation, explain:
  a. What the user should look for.
  b. What the result might indicate.
  c. What the result cannot establish on its own.
- Explain what evidence would support or weaken each explanation.
- Consider at least two plausible explanations when the evidence
  permits it.
- Do not assume that a single observation proves causation.
- Keep suggestions feasible without photographs, purchases,
  special equipment, or trespassing.


5. TEACH THROUGH REFLECTION
- Be constructive, curious, and specific.
- Avoid generic praise and unnecessarily technical language.
- Help the user understand why their evidence supports or fails to support
  their reasoning.
- Ask one thoughtful question that challenges an assumption or helps
  distinguish between alternative explanations.

OUTPUT REQUIREMENTS
Return ONLY valid JSON with exactly these fields:
{{
  "summary": "Balanced assessment grounded in the supplied information",
  "evidence": ["Specific support from the actual observations"],
  "assumptions": ["Unverified claims or alternative explanations"],
  "next_steps": ["Practical observations that could test the hypothesis"],
  "reflection_question": "One thoughtful question encouraging deeper reasoning"
}}

Additional requirements:
- Preserve the existing field names and expected data types.
- Keep each point concise, concrete, and grounded in the user's notes.
- Do not invent details to make the analysis sound more convincing.
- Do not wrap the JSON in Markdown fences.
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