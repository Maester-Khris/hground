import json
import os
import asyncio
import time

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import redis.asyncio as redis
from services.inference import InferenceService
from services.cleaner import TextCleaner

load_dotenv()

# --- Global State Container ---
class AppState:
    def __init__(self):
        self.redis = None
        self.inference = None
        self.worker_task = None
        self.is_healthy = True

state = AppState()

@asynccontextmanager
async def lifespan(app: FastAPI):
    # --- Startup ---
    state.redis = redis.from_url(os.getenv("REDIS_URL"), decode_responses=True)
    state.inference = InferenceService()
    
    # Inject the worker loop from your previous worker.py logic
    from internal.worker_loop import start_worker_loop
    state.worker_task = asyncio.create_task(start_worker_loop(state.redis, state.inference))
    
    print("Inference Service & Background Worker Started")
    yield
    # --- Shutdown ---
    state.worker_task.cancel()
    if state.redis:
        await state.redis.close()
    print("Service Shutdown Complete")


app = FastAPI(title="AI Evaluator, Groq Inference Service", lifespan=lifespan)

ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("ALLOWED_ORIGINS", "http://localhost:5173").split(",")
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["GET", "POST"],
    allow_headers=["Content-Type", "Authorization", "X-Request-ID", "If-None-Match"],
)

# -------------------------- Endpoints ------------------------------
# 5. Create Rest endpoint: /home, /health, /generate-response
@app.get("/")
@app.get("/home")
async def home():
    return {
        "service": "AI Evaluator Inference API",
        "description": "Background worker and REST API for high-performance AI evaluation using Groq.",
        "version": "1.1.0",
        "status": "online",
        "endpoints": {
            "health": "/health",
            "docs": "/docs",
            "redoc": "/redoc"
        },
        "engine": "FastAPI + Redis Streams + Groq Llama-3"
    }


@app.get("/health")
async def health():
    start_time = time.time()
    
    # 1. Check Redis
    try:
        redis_up = await state.redis.ping() if state.redis else False
    except Exception:
        redis_up = False

    # 2. Check Groq/Inference
    ai_up = await state.inference.check_readiness() if state.inference else False
    
    duration = time.time() - start_time
    status_code = 200 if (redis_up and ai_up) else 503
    
    return {
        "status": "operational" if status_code == 200 else "degraded",
        "duration_ms": round(duration * 1000, 2),
        "checks": {
            "redis": "connected" if redis_up else "disconnected",
            "ai_provider": "ready" if ai_up else "unreachable",
            "worker_loop": "active" if state.worker_task and not state.worker_task.done() else "failed"
        },
        "timestamp": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    }