import type { ExtractionResult } from "./types";

/**
 * Posts a PDF to the mock extraction endpoint.
 *
 * NOTE: `/api/extract` is a frontend-only Next.js Route Handler that returns fixture data.
 * When the real FastAPI backend is built, point this at it (and generate the return type from
 * its OpenAPI schema). No component changes required.
 */
export async function postExtract(file: File): Promise<ExtractionResult> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/extract", { method: "POST", body });
  if (!res.ok) {
    throw new Error(`Extraction failed (${res.status})`);
  }
  return (await res.json()) as ExtractionResult;
}
