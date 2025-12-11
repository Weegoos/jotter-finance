from __future__ import annotations

from typing import List, Literal, Optional

from pydantic import BaseModel, Field, field_validator


class ChatMessage(BaseModel):
    role: Literal["system", "user", "assistant"] = Field(
        ..., description="Message role as expected by OpenAI-compatible APIs"
    )
    content: str = Field(..., description="Message content")

    @field_validator("content")
    @classmethod
    def content_not_empty(cls, value: str) -> str:
        if not value.strip():
            raise ValueError("content cannot be empty")
        return value


class ChatRequest(BaseModel):
    messages: List[ChatMessage] = Field(
        ..., description="Conversation messages in chronological order"
    )
    model: Optional[str] = Field(
        default=None,
        description="Override model name; defaults to PRIMARY_LLM_MODEL from env",
    )
    temperature: float = Field(
        default=0.7, ge=0, le=2, description="Sampling temperature"
    )
    top_p: float = Field(
        default=1.0, ge=0, le=1, description="Top-p nucleus sampling parameter"
    )


class ChatResponse(BaseModel):
    model: str = Field(..., description="Model used to generate the response")
    message: str = Field(..., description="Assistant message content")
    raw: Optional[dict] = Field(
        default=None, description="Raw provider response for debugging"
    )


# ============================================================================
# Streaming Event Models (для фронтенда)
# ============================================================================


class StreamEventTopic(BaseModel):
    """
    Событие топика - отправляется в начале генерации ответа.
    Фронтенд может использовать для отображения "Генерирую ответ на: ..."
    """

    type: Literal["topic"] = Field(default="topic", description="Тип события")
    user_query: str = Field(..., description="Оригинальный запрос пользователя")
    status: str = Field(
        default="generating", description="Статус генерации: generating, completed, error"
    )
    message: str = Field(..., description="Сообщение для отображения пользователю")


class StreamEventContent(BaseModel):
    """
    Событие контента - токены ответа от LLM.
    """

    type: Literal["content"] = Field(default="content", description="Тип события")
    delta: str = Field(..., description="Часть ответа (токен или текст)")


class StreamEventDone(BaseModel):
    """
    Событие завершения - отправляется когда генерация закончена.
    """

    type: Literal["done"] = Field(default="done", description="Тип события")
    status: str = Field(default="completed", description="Финальный статус")
    user_query: str = Field(..., description="Оригинальный запрос пользователя")


class StreamEventError(BaseModel):
    """
    Событие ошибки - отправляется при возникновении ошибки.
    """

    type: Literal["error"] = Field(default="error", description="Тип события")
    error: str = Field(..., description="Описание ошибки")
    user_query: Optional[str] = Field(
        default=None, description="Оригинальный запрос пользователя"
    )
