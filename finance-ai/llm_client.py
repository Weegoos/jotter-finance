from __future__ import annotations

from typing import Any, AsyncIterator, Dict, List, Optional

import httpx

from config import Settings
from schemas import ChatMessage


class AlemLLMClient:
    """
    Minimal Alem/OpenAI-compatible chat client with streaming support.

    This client targets an OpenAI-style /chat/completions endpoint. Adjust the
    payload or parsing logic if your provider differs.
    """

    def __init__(self, settings: Settings, client: Optional[httpx.AsyncClient] = None):
        self.settings = settings
        self._client = client or httpx.AsyncClient(timeout=120)
        self.base_url = settings.alem_base_url.rstrip("/")

    async def chat(
        self,
        messages: List[ChatMessage],
        *,
        model: Optional[str] = None,
        temperature: float = 0.7,
        top_p: float = 1.0,
    ) -> Dict[str, Any]:
        payload = {
            "model": model or self.settings.primary_llm_model,
            "messages": [message.model_dump() for message in messages],
            "temperature": temperature,
            "top_p": top_p,
        }

        headers = {
            "Authorization": f"Bearer {self.settings.alem_api_key or ''}",
            "Content-Type": "application/json",
        }

        response = await self._client.post(
            f"{self.base_url}/chat/completions", json=payload, headers=headers
        )
        response.raise_for_status()

        data = response.json()
        # Attempt to parse OpenAI-style response; fallback to raw.
        message_text = (
            data.get("choices", [{}])[0].get("message", {}).get("content", "")
        )

        return {
            "model": payload["model"],
            "message": message_text,
            "raw": data,
        }

    async def chat_stream(
        self,
        messages: List[ChatMessage],
        *,
        model: Optional[str] = None,
        temperature: float = 0.7,
        top_p: float = 1.0,
    ) -> AsyncIterator[str]:
        """
        Streaming chat completion - yields SSE chunks as they arrive.

        Each yielded string is a JSON chunk from the OpenAI-compatible API.
        """
        payload = {
            "model": model or self.settings.primary_llm_model,
            "messages": [message.model_dump() for message in messages],
            "temperature": temperature,
            "top_p": top_p,
            "stream": True,
        }

        headers = {
            "Authorization": f"Bearer {self.settings.alem_api_key or ''}",
            "Content-Type": "application/json",
        }

        async with self._client.stream(
            "POST",
            f"{self.base_url}/chat/completions",
            json=payload,
            headers=headers,
        ) as response:
            response.raise_for_status()
            async for line in response.aiter_lines():
                line = line.strip()
                if not line:
                    continue
                if line.startswith("data: "):
                    data = line[6:]
                    if data == "[DONE]":
                        break
                    yield data

    async def aclose(self) -> None:
        await self._client.aclose()
