"""
Sugam Safar Backend — FastAPI Application Entry Point
Crowd-Aware Bus Journey Planner for Delhi
"""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from src.api.routes import router

app = FastAPI(
    title="Sugam Safar API",
    description="Crowd-aware Delhi bus journey planner — CrowdTwin Intelligence",
    version="0.1.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

# CORS for React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://127.0.0.1:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router)


@app.get("/health")
def health():
    return {"status": "ok", "service": "Sugam Safar API", "version": "0.1.0"}


if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
