from __future__ import annotations

from functools import lru_cache
from typing import Optional

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Central configuration for the LLM service."""

    db_dsn: str = Field(..., description="Full Postgres DSN string")

    primary_llm_model: str = Field(
        default="alemllm",
        description="Default model used for chat completions",
    )
    alem_base_url: str = Field(
        default="https://llm.alem.ai/v1",
        description="Base URL for Alem LLM API",
    )

    alem_api_key: Optional[str] = Field(default=None, description="API key for AlemLLM")

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore",
        validate_default=False,
    )


@lru_cache(maxsize=1)
def get_settings() -> Settings:
    """Singleton settings instance with caching for FastAPI dependency use."""
    return Settings()  # type: ignore[arg-type]
