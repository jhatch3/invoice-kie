"""Extraction routes.

- POST /extract                 public: run the pipeline on one uploaded document.
- POST /internal/extract-batch  hidden (include_in_schema=False): many documents at once.

`/extract` is a sync `def` route because pipeline inference is blocking/CPU-bound, so FastAPI runs
it in its threadpool; `valid_upload` (async) has already read + validated the file. The batch
route is async because it awaits reading several uploads before handing (filename, bytes) pairs to
the same service layer.
"""

from __future__ import annotations

from fastapi import APIRouter, Depends, UploadFile

from app.extraction.dependencies import valid_upload
from app.extraction.pipeline import Pipeline, get_pipeline
from app.extraction.schemas import ExtractResponse
from app.extraction.service import extract_one, run_batch

router = APIRouter(tags=["extraction"])


@router.post("/extract", response_model=ExtractResponse, status_code=200)
def extract(
    upload: tuple[str, bytes] = Depends(valid_upload),
    pipeline: Pipeline = Depends(get_pipeline),
) -> ExtractResponse:
    """Extract fields + line items from a single receipt/invoice document."""
    filename, content = upload
    return extract_one(content, filename, pipeline)


@router.post(
    "/internal/extract-batch",
    response_model=list[ExtractResponse],
    status_code=200,
    include_in_schema=False,
)
async def extract_batch(
    files: list[UploadFile],
    pipeline: Pipeline = Depends(get_pipeline),
) -> list[ExtractResponse]:
    """Batch extraction for eval/tooling. Not part of the public (frontend) API."""
    pairs = [(file.filename or "upload", await file.read()) for file in files]
    return run_batch(pairs, pipeline)
