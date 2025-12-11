"""
Pydantic schemas for the pAIda API.
"""

from __future__ import annotations

from pydantic import BaseModel, Field


class ChatMessage(BaseModel):
    """Сообщение в чате для LLM."""

    role: str = Field(..., description="Роль: system, user, assistant")
    content: str = Field(..., description="Содержимое сообщения")
