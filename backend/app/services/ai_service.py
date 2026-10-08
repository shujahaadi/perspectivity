from app.schemas.activity import ActivityRequest, FieldActivity


async def generate_activity(request: ActivityRequest) -> FieldActivity:
    if request.experience == "researcher":
        mission = (
            "Find three examples of nature interacting with human "
            "infrastructure and form one hypothesis explaining the pattern."
        )
        observations_required = 3

    elif request.experience == "explorer":
        mission = (
            "Find three examples of nature interacting with human "
            "infrastructure. Pay attention to where and how they occur."
        )
        observations_required = 3

    else:
        mission = (
            "Find two examples of nature interacting with human "
            "infrastructure."
        )
        observations_required = 2

    return FieldActivity(
        title="Nature in Concrete",
        role="Urban Ecologist",
        question="How does nature adapt to the built environment?",
        mission=mission,
        rules=[
            "Do not take photographs",
            "Keep your phone away except when recording a field note"
        ],
        observations_required=observations_required
    )