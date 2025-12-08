from __future__ import annotations
from contextlib import asynccontextmanager
from typing import Optional

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from config import Settings, get_settings
from llm_client import AlemLLMClient
from schemas import ChatRequest, ChatResponse


class KeyVerifyResponse(BaseModel):
    """Response model for API key verification."""

    provider: str
    status: str
    message: str
    details: Optional[dict] = None


class LLMTestRequest(BaseModel):
    """Request model for testing LLM API keys."""

    message: str = "Привет! Как дела?"
    max_tokens: int = 100
    temperature: float = 0.7


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize shared LLM client for the app lifecycle.
    settings = get_settings()
    app.state.settings = settings
    app.state.llm_client = AlemLLMClient(settings)
    try:
        yield
    finally:
        await app.state.llm_client.aclose()

app = FastAPI(
    title="Jotter Finance LLM API",
    description="LLM gateway for testing provider responses (Swagger available).",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

@app.on_event("startup")
async def startup_event():
    settings = get_settings()
    app.state.settings = settings
    app.state.llm_client = AlemLLMClient(settings)

@app.on_event("shutdown")
async def shutdown_event():
    await app.state.llm_client.aclose()


origins = [
    "http://localhost:9000",
]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_llm_client(request: Request) -> AlemLLMClient:
    return request.app.state.llm_client


@app.get("/health", summary="Health check")
async def health():
    return {"status": "ok"}


@app.get(
    "/settings/keys",
    summary="Get configured API keys status",
    tags=["Settings"],
)
async def get_api_keys_status(settings: Settings = Depends(get_settings)):
    """Show which API keys are configured (masked for security)."""

    def mask_key(key: str | None) -> str:
        if not key:
            return "❌ not set"
        return f"✅ {key[:8]}...{key[-4:]}" if len(key) > 12 else "✅ ***"

    return {
        "db_dsn": "✅ configured" if settings.db_dsn else "❌ not set",
        "primary_llm_model": settings.primary_llm_model,
        "alem_base_url": settings.alem_base_url,
        "alem_api_key": mask_key(settings.alem_api_key),
        "qwen3_api_key": mask_key(settings.qwen3_api_key),
    }


# ============================================================================
# API Key Verification Endpoints
# ============================================================================


async def _test_llm_key(
    base_url: str,
    api_key: str | None,
    provider: str,
    model: str,
    user_message: str,
    max_tokens: int = 100,
    temperature: float = 0.7,
) -> KeyVerifyResponse:
    """Helper to test LLM API keys via chat completions endpoint."""
    if not api_key:
        return KeyVerifyResponse(
            provider=provider,
            status="error",
            message="❌ API key not configured",
        )

    try:
        async with httpx.AsyncClient(timeout=60) as client:
            response = await client.post(
                f"{base_url.rstrip('/')}/chat/completions",
                headers={
                    "Authorization": f"Bearer {api_key}",
                    "Content-Type": "application/json",
                },
                json={
                    "model": model,
                    "messages": [{"role": "user", "content": user_message}],
                    "max_tokens": max_tokens,
                    "temperature": temperature,
                },
            )

            if response.status_code == 200:
                data = response.json()
                # Extract the assistant's response
                assistant_message = (
                    data.get("choices", [{}])[0].get("message", {}).get("content", "")
                )
                return KeyVerifyResponse(
                    provider=provider,
                    status="success",
                    message="✅ API key is valid and working",
                    details={
                        "your_message": user_message,
                        "assistant_response": assistant_message,
                        "model": model,
                        "raw_response": data,
                    },
                )
            elif response.status_code == 401:
                return KeyVerifyResponse(
                    provider=provider,
                    status="error",
                    message="❌ Invalid API key (401 Unauthorized)",
                )
            elif response.status_code == 403:
                return KeyVerifyResponse(
                    provider=provider,
                    status="error",
                    message="❌ Access denied (403 Forbidden)",
                )
            else:
                return KeyVerifyResponse(
                    provider=provider,
                    status="error",
                    message=f"❌ Request failed with status {response.status_code}",
                    details={"response": response.text[:500]},
                )
    except httpx.TimeoutException:
        return KeyVerifyResponse(
            provider=provider,
            status="error",
            message="❌ Request timed out (60s)",
        )
    except Exception as e:
        return KeyVerifyResponse(
            provider=provider,
            status="error",
            message=f"❌ Connection error: {str(e)}",
        )


@app.post(
    "/test/qwen3",
    response_model=KeyVerifyResponse,
    summary="🧪 Test Qwen3",
    tags=["🔑 API Key Testing"],
)
async def test_qwen3_key(
    request: LLMTestRequest,
    settings: Settings = Depends(get_settings),
):
    """Send a message to Qwen3 and get response."""
    return await _test_llm_key(
        base_url=settings.alem_base_url,
        api_key=settings.qwen3_api_key,
        provider="Qwen3",
        model="qwen3",
        user_message=request.message,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
    )


@app.post(
    "/test/alemllm",
    response_model=KeyVerifyResponse,
    summary="🧪 Test AlemLLM",
    tags=["🔑 API Key Testing"],
)
async def test_alemllm_key(
    request: LLMTestRequest,
    settings: Settings = Depends(get_settings),
):
    """Send a message to AlemLLM and get response (main Alem model)."""
    return await _test_llm_key(
        base_url=settings.alem_base_url,
        api_key=settings.alem_api_key,
        provider="AlemLLM",
        model="alemllm",
        user_message=request.message,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
    )


@app.post(
    "/test/all",
    summary="🧪 Quick Test All API Keys",
    tags=["🔑 API Key Testing"],
)
async def test_all_keys(settings: Settings = Depends(get_settings)):
    """Quick test all configured API keys with default messages."""
    llm_req = LLMTestRequest()

    results = {
        "alemllm": await test_alemllm_key(llm_req, settings),
        "qwen3": await test_qwen3_key(llm_req, settings),
    }

    summary = {
        "total": len(results),
        "success": sum(1 for r in results.values() if r.status == "success"),
        "failed": sum(1 for r in results.values() if r.status == "error"),
    }

    return {
        "summary": summary,
        "results": {k: v.model_dump() for k, v in results.items()},
    }


@app.post(
    "/llm/chat",
    response_model=ChatResponse,
    summary="Send chat completion request",
    tags=["LLM"],
)
async def chat_endpoint(
    request: ChatRequest,
    client: AlemLLMClient = Depends(get_llm_client),
    settings: Settings = Depends(get_settings),
):
    try:
        result = await client.chat(
            request.messages,
            model=request.model or settings.primary_llm_model,
            temperature=request.temperature,
            top_p=request.top_p,
        )
    except Exception as exc:  # pragma: no cover - defensive logging path
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(**result)


@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=2500)