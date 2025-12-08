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
