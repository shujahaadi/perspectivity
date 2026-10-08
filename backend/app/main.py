from fastapi import FastAPI

from app.api.activities import router as activities_router


app = FastAPI(
    title="Perspectivity API",
    description="Backend for Perspectivity — Perspective + Activity",
    version="0.1.0",
)


app.include_router(activities_router)


@app.get("/")
async def root():
    return {
        "message": "Perspectivity API is running"
    }