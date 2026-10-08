from app.schemas.activity import ActivityRequest, FieldActivity


async def generate_activity(request: ActivityRequest) -> FieldActivity:
    # Temporary implementation.
    # AI integration will replace this later.
    return FieldActivity(
        title="Nature in Concrete",
        role="Urban Ecologist",
        question="How does nature adapt to the built environment?",
        mission="Find three examples of nature interacting with human infrastructure.",
        rules=[
            "Do not take photographs",
            "Keep your phone away except when recording a field note"
        ],
        observations_required=3
    )