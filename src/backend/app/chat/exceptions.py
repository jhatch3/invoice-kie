"""Chat-domain exceptions (subclass the app-wide AppError).

Upload-validation errors (415/400/413) and the SDK-failure mappings (429/422/503) each carry a
status code and a user-facing detail; the registered AppError handler renders them.
"""

from __future__ import annotations

from app.exceptions import AppError


class UnsupportedImageType(AppError):
    status_code = 415
    detail = "Unsupported image type. Upload a PNG or JPEG."


class EmptyImage(AppError):
    status_code = 400
    detail = "The uploaded image is empty."


class ImageTooLarge(AppError):
    status_code = 413
    detail = "Image is too large (max ~4.5 MB)."


class ChatRateLimited(AppError):
    status_code = 429
    detail = "Rate limited by the model API. Try again shortly."


class ChatBadRequest(AppError):
    status_code = 422
    detail = "The model API rejected the request (e.g. an unsupported image)."


class ChatUnavailable(AppError):
    status_code = 503
    detail = "Chat is unavailable — check ANTHROPIC_API_KEY / model credentials."
