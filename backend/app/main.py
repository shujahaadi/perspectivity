from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.activities import router as activities_router
from app.api.sessions import router as sessions_router

app = FastAPI(
    title="Perspectivity API",
    description="Backend for Perspectivity — Perspective + Activity",
    version="0.1.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(activities_router)
app.include_router(sessions_router)

@app.get("/")
async def root():
    return {
        "message": "Perspectivity API is running"
    }