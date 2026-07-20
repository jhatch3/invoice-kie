import type { ExtractionResult } from "./types";

export type ExtractMode = "live" | "mock";

export interface ExtractOutcome {
  result: ExtractionResult;
  mode: ExtractMode;
}

/**
 * Posts a document to `/api/extract` (a Next.js Route Handler) and returns the extracted fields
 * plus whether they came from the live FastAPI backend or the built-in mock.
 */
export async function postExtract(file: File): Promise<ExtractOutcome> {
  const body = new FormData();
  body.append("file", file);

  const res = await fetch("/api/extract", { method: "POST", body });
  if (!res.ok) {
    throw new Error(`Extraction failed (${res.status})`);
  }

  const mode: ExtractMode = res.headers.get("X-Extract-Mode") === "live" ? "live" : "mock";
  const result = (await res.json()) as ExtractionResult;
  return { result, mode };
}
