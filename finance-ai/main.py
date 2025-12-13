from __future__ import annotations

import json
from typing import List, Optional

import httpx
from fastapi import Depends, FastAPI, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, StreamingResponse
from pydantic import BaseModel, Field

from config import Settings, get_settings
from llm_client import AlemLLMClient
from prompts import (
    PAIDA_SYSTEM_PROMPT,
    PAIDA_WELCOME_MESSAGE,
    THINKING_STEPS_PROMPT,
    CHAT_TOPIC_PROMPT,
)
from schemas import ChatMessage


# ============================================================================
# Request/Response Models
# ============================================================================


class ChatRequest(BaseModel):
    """Запрос к чату pAIda."""

    message: str = Field(..., description="Сообщение пользователя", min_length=1)
    conversation_history: Optional[List[ChatMessage]] = Field(
        default=None,
        description="История диалога для контекста",
    )
    conversation_id: Optional[str] = Field(
        default=None,
        description="UUID существующего чата (None = новый чат, топик сгенерируется автоматически)",
    )
    model: Optional[str] = Field(default=None, description="Модель LLM")
    temperature: float = Field(default=0.7, ge=0, le=2)


class ChatResponse(BaseModel):
    """Ответ от pAIda."""

    thinking_steps: List[str] = Field(
        ..., description="Шаги мышления — что делает ассистент"
    )
    message: str = Field(..., description="Ответ ассистента")
    model: str = Field(..., description="Использованная модель")
    conversation_id: Optional[str] = Field(
        default=None,
        description="UUID чата (передаётся обратно для удобства)",
    )
    generated_topic: Optional[str] = Field(
        default=None,
        description="Сгенерированное название топика (если generate_topic=True)",
    )


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


# ============================================================================
# Streaming Event Models
# ============================================================================


class StreamEventThinking(BaseModel):
    """Шаги мышления — что делает LLM (как в ChatGPT)."""

    type: str = "thinking"
    steps: List[str] = Field(..., description="Список шагов мышления")


class StreamEventContent(BaseModel):
    """Токен ответа."""

    type: str = "content"
    delta: str


class StreamEventTopic(BaseModel):
    """Сгенерированный топик чата."""

    type: str = "topic"
    topic: str = Field(..., description="Название топика")
    conversation_id: Optional[str] = Field(default=None, description="UUID чата")


class StreamEventDone(BaseModel):
    """Завершение генерации."""

    type: str = "done"
    status: str = "completed"


class StreamEventError(BaseModel):
    """Ошибка генерации."""

    type: str = "error"
    error: str


# ============================================================================
# FastAPI App
# ============================================================================

app = FastAPI(
    title="Jotter Finance - pAIda API",
    description="Финансовый AI-ассистент pAIda",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)


@app.on_event("startup")
async def startup_event():
    settings = get_settings()
    app.state.settings = settings
    app.state.llm_client = AlemLLMClient(settings)


@app.on_event("shutdown")
async def shutdown_event():
    await app.state.llm_client.aclose()


app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:9000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def get_llm_client(request: Request) -> AlemLLMClient:
    return request.app.state.llm_client


def build_messages(
    user_message: str,
    conversation_history: Optional[List[ChatMessage]] = None,
) -> List[ChatMessage]:
    """
    Собирает список сообщений для LLM.
    Системный промпт pAIda автоматически добавляется.
    """
    messages = [ChatMessage(role="system", content=PAIDA_SYSTEM_PROMPT)]

    # Добавляем историю диалога
    if conversation_history:
        for msg in conversation_history:
            if msg.role != "system":  # Игнорируем system из истории
                messages.append(ChatMessage(role=msg.role, content=msg.content))

    # Добавляем текущее сообщение
    messages.append(ChatMessage(role="user", content=user_message))

    return messages


def get_fallback_steps(user_message: str) -> List[str]:
    """Генерирует fallback шаги мышления на основе языка сообщения."""
    has_cyrillic = any("\u0400" <= c <= "\u04ff" for c in user_message)
    has_kazakh = any(c in "әғқңөұүһі" for c in user_message.lower())

    if has_kazakh:
        return [
            "Сұрақты талдап жатырмын",
            "Қажетті ақпаратты іздеп жатырмын",
            "Жауапты дайындап жатырмын",
        ]
    elif has_cyrillic:
        return [
            "Анализирую твой запрос",
            "Подбираю нужную информацию",
            "Формирую ответ",
        ]
    else:
        return [
            "Analyzing your request",
            "Gathering relevant information",
            "Preparing the response",
        ]


async def generate_thinking_steps(
    client: AlemLLMClient,
    user_message: str,
    model: str,
) -> List[str]:
    """
    Генерирует шаги мышления (как в ChatGPT).
    Возвращает список из 3-5 шагов.
    """
    fallback = get_fallback_steps(user_message)

    topic_prompt = THINKING_STEPS_PROMPT.format(user_message=user_message)

    messages = [
        ChatMessage(role="user", content=topic_prompt),
    ]

    try:
        result = await client.chat(
            messages,
            model=model,
            temperature=0.7,
        )
        response = result.get("message", "").strip()

        # Парсим шаги (каждая строка = один шаг)
        steps = []
        for line in response.split("\n"):
            line = line.strip()
            # Убираем нумерацию и маркеры
            line = line.lstrip("0123456789.-–•) ")
            line = line.strip("\"'`")

            if line and len(line) > 3 and len(line) < 100:
                steps.append(line)

        # Возвращаем 3-5 шагов
        if len(steps) >= 3:
            return steps[:5]
        else:
            return fallback

    except Exception:
        return fallback


async def generate_chat_topic(
    client: AlemLLMClient,
    user_message: str,
    model: str,
) -> Optional[str]:
    """
    Генерирует короткое название (топик) для чата на основе первого сообщения.
    Возвращает строку 2-5 слов или None при ошибке.
    """
    prompt = CHAT_TOPIC_PROMPT.format(message=user_message)

    messages = [
        ChatMessage(role="user", content=prompt),
    ]

    try:
        result = await client.chat(
            messages,
            model=model,
            temperature=0.5,  # Ниже температура для более стабильных названий
        )
        topic = result.get("message", "").strip()

        # Очистка от лишних символов
        topic = topic.strip('"\'`«»„"')
        topic = topic.rstrip(".")

        # Валидация: 2-50 символов
        if topic and 2 <= len(topic) <= 50:
            return topic

        return None

    except Exception:
        return None


# ============================================================================
# Main Chat Endpoints
# ============================================================================


@app.post(
    "/llm/smart-chat",
    response_model=ChatResponse,
    summary="💬 Чат с pAIda",
    description="""
Финансовый AI-ассистент pAIda.

**Возможности:**
- Понимает русский, казахский и английский
- Отвечает на языке пользователя
- Понимает контекст и опечатки
- Специализируется на финансах

**Примеры запросов:**
- "Привет, помоги с бюджетом"
- "скока я потратил за месец" (с опечатками)
- "менің табысым қанша" (казахский)
- "how to save money" (английский)
""",
    tags=["Chat"],
)
async def chat_endpoint(
    request: ChatRequest,
    client: AlemLLMClient = Depends(get_llm_client),
    settings: Settings = Depends(get_settings),
):
    """Основной эндпоинт чата с pAIda."""
    model = request.model or settings.primary_llm_model

    # Генерируем шаги мышления
    thinking_steps = await generate_thinking_steps(client, request.message, model)

    # Генерируем топик для первого сообщения (нет истории)
    generated_topic = None
    is_first_message = (
        not request.conversation_history or len(request.conversation_history) == 0
    )
    if is_first_message:
        generated_topic = await generate_chat_topic(client, request.message, model)

    messages = build_messages(request.message, request.conversation_history)

    try:
        result = await client.chat(
            messages,
            model=model,
            temperature=request.temperature,
        )
    except Exception as exc:
        raise HTTPException(status_code=502, detail=str(exc)) from exc

    return ChatResponse(
        thinking_steps=thinking_steps,
        message=result.get("message", ""),
        model=result.get("model", model),
        conversation_id=request.conversation_id,
        generated_topic=generated_topic,
    )


@app.post(
    "/llm/smart-chat/stream",
    summary="💬 Стриминговый чат с pAIda (SSE)",
    description="Ответ в реальном времени, токен за токеном.",
    tags=["Chat"],
)
async def chat_stream_endpoint(
    request: ChatRequest,
    client: AlemLLMClient = Depends(get_llm_client),
    settings: Settings = Depends(get_settings),
):
    """Стриминговый чат с pAIda."""
    model = request.model or settings.primary_llm_model

    # Сначала генерируем шаги мышления
    thinking_steps = await generate_thinking_steps(client, request.message, model)

    # Генерируем топик для первого сообщения (нет истории)
    generated_topic = None
    is_first_message = (
        not request.conversation_history or len(request.conversation_history) == 0
    )
    if is_first_message:
        generated_topic = await generate_chat_topic(client, request.message, model)

    messages = build_messages(request.message, request.conversation_history)

    async def generate():
        try:
            # 1. Отправляем шаги мышления первым событием
            thinking_event = StreamEventThinking(steps=thinking_steps)
            yield f"data: {thinking_event.model_dump_json()}\n\n"

            # 2. Отправляем топик если был сгенерирован
            if generated_topic:
                topic_event = StreamEventTopic(
                    topic=generated_topic,
                    conversation_id=request.conversation_id,
                )
                yield f"data: {topic_event.model_dump_json()}\n\n"

            # 3. Стримим основной контент
            async for chunk in client.chat_stream(
                messages,
                model=model,
                temperature=request.temperature,
            ):
                try:
                    chunk_data = json.loads(chunk)
                    delta = (
                        chunk_data.get("choices", [{}])[0]
                        .get("delta", {})
                        .get("content", "")
                    )
                    if delta:
                        event = StreamEventContent(delta=delta)
                        yield f"data: {event.model_dump_json()}\n\n"
                except json.JSONDecodeError:
                    if chunk.strip():
                        event = StreamEventContent(delta=chunk)
                        yield f"data: {event.model_dump_json()}\n\n"

            # 4. Завершение
            done = StreamEventDone()
            yield f"data: {done.model_dump_json()}\n\n"

        except Exception as exc:
            error = StreamEventError(error=str(exc))
            yield f"data: {error.model_dump_json()}\n\n"

    return StreamingResponse(
        generate(),
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "X-Accel-Buffering": "no",
        },
    )


# ============================================================================
# Info & Health Endpoints
# ============================================================================


@app.get("/health", summary="Health check")
async def health():
    return {"status": "ok"}


@app.get("/paida/info", summary="Информация о pAIda", tags=["Info"])
async def get_paida_info():
    """Информация об ассистенте pAIda."""
    return {
        "name": "pAIda",
        "description": "Финансовый AI-ассистент Jotter Finance",
        "welcome_message": PAIDA_WELCOME_MESSAGE,
        "capabilities": [
            "Анализ личных финансов",
            "Бюджетирование",
            "Советы по инвестициям",
            "Финансовое планирование",
            "Управление расходами",
        ],
        "supported_languages": ["Русский", "Қазақша", "English"],
    }


# ============================================================================
# API Key Testing (для отладки)
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
    """Helper to test LLM API keys."""
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
                assistant_message = (
                    data.get("choices", [{}])[0].get("message", {}).get("content", "")
                )
                return KeyVerifyResponse(
                    provider=provider,
                    status="success",
                    message="✅ API key is valid",
                    details={"response": assistant_message[:200]},
                )
            else:
                return KeyVerifyResponse(
                    provider=provider,
                    status="error",
                    message=f"❌ Status {response.status_code}",
                )
    except Exception as e:
        return KeyVerifyResponse(
            provider=provider,
            status="error",
            message=f"❌ Error: {str(e)}",
        )


@app.post(
    "/test/alemllm",
    response_model=KeyVerifyResponse,
    summary="🧪 Test AlemLLM",
    tags=["Testing"],
)
async def test_alemllm_key(
    request: LLMTestRequest,
    settings: Settings = Depends(get_settings),
):
    """Тест подключения к AlemLLM."""
    return await _test_llm_key(
        base_url=settings.alem_base_url,
        api_key=settings.alem_api_key,
        provider="AlemLLM",
        model="alemllm",
        user_message=request.message,
        max_tokens=request.max_tokens,
        temperature=request.temperature,
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(_, exc: Exception):
    return JSONResponse(status_code=500, content={"detail": str(exc)})


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=2500)
