"""FastAPI application factory.

Wires config, CORS (local only), exception handlers, and the extraction router. Docs are hidden
outside local/staging. Run:  uvicorn app.main:app --app-dir src/backend --reload
"""

from __future__ import annotations

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import get_settings
from app.exceptions import register_exception_handlers
from app.extraction.router import router as extraction_router


def health() -> dict[str, str]:
    """Liveness probe -> {"status": "ok"}."""
    return {"status": "ok"}


def create_app() -> FastAPI:
    """Build and configure the FastAPI app."""
    settings = get_settings()

    app = FastAPI(
        title="invoice-kie",
        version="0.1.0",
        docs_url="/docs" if settings.docs_enabled else None,
        redoc_url="/redoc" if settings.docs_enabled else None,
    )

    if settings.environment == "local" and settings.cors_origins:
        app.add_middleware(
            CORSMiddleware,
            allow_origins=settings.cors_origins,
            allow_credentials=True,
            allow_methods=["*"],
            allow_headers=["*"],
        )

    register_exception_handlers(app)
    app.add_api_route("/health", health, methods=["GET"], tags=["health"])
    app.include_router(extraction_router)
    return app


app = create_app()
