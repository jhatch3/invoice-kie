"""Business logic for extraction — orchestrates the pipeline and builds responses.

Routes stay thin; they call these functions. `run_batch` powers the internal batch endpoint and
the Phase-3 eval harness.
"""

from __future__ import annotations

from app.extraction.pipeline import Pipeline
from app.extraction.schemas import ExtractResponse
from backend.app.extraction.exceptions import ExtractionFailed


def extract_one(content: bytes, filename: str, pipeline: Pipeline) -> ExtractResponse:
    """Run the pipeline on a single document and wrap it in an ExtractResponse."""
    raise NotImplementedError


def run_batch(
    files: list[tuple[str, bytes]],
    pipeline: Pipeline,
) -> list[ExtractResponse]:
    """Run the pipeline over many (filename, content) pairs. Internal / eval use."""
    
    if not files:
        raise ExtractionFailed("No files provided for extraction.")
    

    extraction_results = []
    for filename, content in files:
        if not content:
            raise ExtractionFailed(f"File {filename} is empty.")
        
        extraction_result = extract_one(content, filename, pipeline)
        extraction_results.append(extraction_result)

    return extraction_results
