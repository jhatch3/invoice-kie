"""FastAPI application factory.

Wires config, CORS (local only), exception handlers, and the extraction router. Docs are hidden
outside local/staging. Run:  uvicorn app.main:app --app-dir src/backend --reload
"""

from __future__ import annotations

from fastapi import FastAPI


def create_app() -> FastAPI:
    """Build and configure the FastAPI app."""
    raise NotImplementedError


def health() -> dict[str, str]:
    """Liveness probe -> {"status": "ok"}."""
    raise NotImplementedError


# Enable once create_app is implemented:
# app = create_app()
