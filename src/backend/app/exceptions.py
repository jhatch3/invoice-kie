"""Base application exception and its HTTP handler.

Domain modules subclass `AppError` (see `extraction/exceptions.py`) so every failure carries a
status code and a user-facing detail, and a single handler turns them into JSON responses.
"""

from __future__ import annotations

from typing import TYPE_CHECKING

if TYPE_CHECKING:
    from fastapi import FastAPI, Request
    from fastapi.responses import JSONResponse


class AppError(Exception):
    """Base error: subclasses set `status_code` and a human-readable `detail`."""

    status_code: int = 500
    detail: str = "Internal server error."

    def __init__(self, detail: str | None = None) -> None:
        raise NotImplementedError


async def app_error_handler(request: "Request", exc: AppError) -> "JSONResponse":
    """Render an AppError as `{"detail": ...}` with its status code."""
    raise NotImplementedError


def register_exception_handlers(app: "FastAPI") -> None:
    """Attach the AppError handler to the FastAPI app."""
    raise NotImplementedError
