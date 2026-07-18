"""Extraction routes.

- POST /extract            public: run the pipeline on one uploaded document.
- POST /internal/extract-batch  hidden (include_in_schema=False): many documents at once.

Both are sync `def` routes because pipeline inference is blocking/CPU-bound, so FastAPI runs them
in its threadpool.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile

from app.extraction.dependencies import valid_upload
from app.extraction.pipeline import Pipeline, get_pipeline
from app.extraction.schemas import ExtractResponse

router = APIRouter(tags=["extraction"])


@router.post("/extract", response_model=ExtractResponse, status_code=200)
def extract(
    file: UploadFile = Depends(valid_upload),
    pipeline: Pipeline = Depends(get_pipeline),
) -> ExtractResponse:
    """Extract fields + line items from a single receipt/invoice document."""
    raise NotImplementedError


@router.post(
    "/internal/extract-batch",
    response_model=list[ExtractResponse],
    status_code=200,
    include_in_schema=False,
)
def extract_batch(
    files: list[UploadFile],
    pipeline: Pipeline = Depends(get_pipeline),
) -> list[ExtractResponse]:
    """Batch extraction for eval/tooling. Not part of the public (frontend) API."""
    raise NotImplementedError
