"""Extraction-domain exceptions (subclass the app-wide AppError)."""

from __future__ import annotations

from app.exceptions import AppError


class UnsupportedFileType(AppError):
    status_code = 415
    detail = "Unsupported file type. Upload a PDF, PNG, or JPEG."


class FileTooLarge(AppError):
    status_code = 413
    detail = "File is too large."


class EmptyUpload(AppError):
    status_code = 400
    detail = "The uploaded file is empty."


class ExtractionFailed(AppError):
    status_code = 500
    detail = "Extraction failed."
