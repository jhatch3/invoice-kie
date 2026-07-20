"""Global application settings.

Per fastapi-best-practices, configuration is a Pydantic `BaseSettings` object loaded from the
environment. Domain-specific knobs (e.g. upload limits) live in the extraction module's
constants; this holds only app-wide settings.
"""

from __future__ import annotations

from functools import lru_cache
from typing import Literal

from pydantic_settings import BaseSettings, SettingsConfigDict

Environment = Literal["local", "staging", "production"]


class Settings(BaseSettings):
    """App-wide settings, read from environment / .env."""

    model_config = SettingsConfigDict(env_prefix="INVOICE_KIE_", env_file=".env")

    environment: Environment = "local"
    cors_origins: list[str] = ["http://localhost:3000"]

    @property
    def docs_enabled(self) -> bool:
        """Whether interactive API docs should be served (hidden in production)."""
        return self.environment != "production"


@lru_cache
def get_settings() -> Settings:
    """Return a cached Settings instance (constructed once per process)."""
    return Settings()
