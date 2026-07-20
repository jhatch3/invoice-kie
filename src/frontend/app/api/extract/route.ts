import { resultFor, genericResult } from "@/lib/samples";
import type { ExtractionResult } from "@/lib/types";

// Forwards to the FastAPI backend when BACKEND_URL is set and reachable; otherwise returns
// built-in fixture data. So the deployed demo always works, and locally (with the backend up) it
// serves the real model. The `X-Extract-Mode` header tells the UI which path ran.

const BACKEND_URL = process.env.BACKEND_URL;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

function toNumber(value: unknown): number | null {
  if (value === null || value === undefined) return null;
  if (typeof value === "number") return value;
  const n = parseFloat(String(value).replace(/[^0-9.\-]/g, ""));
  return Number.isFinite(n) ? n : null;
}

interface BackendLineItem {
  name?: string | null;
  qty?: string | number | null;
  unit_price?: string | number | null;
  price?: string | number | null;
}
interface BackendResult {
  subtotal?: string | number | null;
  tax?: string | number | null;
  total?: string | number | null;
  currency?: string;
  confidence?: number;
  line_items?: BackendLineItem[];
}
interface BackendResponse {
  result?: BackendResult;
}

// Map the FastAPI ExtractResponse (snake_case, string amounts) to the frontend schema.
function fromBackend(payload: BackendResponse): ExtractionResult {
  const r = payload.result ?? {};
  return {
    subtotal: toNumber(r.subtotal),
    tax: toNumber(r.tax),
    total: toNumber(r.total),
    currency: r.currency ?? "USD",
    confidence: typeof r.confidence === "number" ? r.confidence : 0,
    lineItems: (r.line_items ?? []).map((li) => ({
      name: li.name ?? null,
      qty: toNumber(li.qty),
      unitPrice: toNumber(li.unit_price),
      price: toNumber(li.price),
    })),
  };
}

export async function POST(request: Request): Promise<Response> {
  const form = await request.formData();
  const file = form.get("file");
  const name = file instanceof File ? file.name : "";
  const ms = Number(process.env.EXTRACT_DELAY_MS ?? 1200);

  // Let a file named `fail.pdf` demonstrate the error path.
  if (name === "fail.pdf") {
    await delay(Math.min(ms, 400));
    return Response.json({ message: "Extraction failed" }, { status: 500 });
  }

  // Live backend when configured and reachable; fall back to the mock on any failure.
  if (BACKEND_URL && file instanceof File) {
    try {
      const forwarded = new FormData();
      forwarded.append("file", file);
      const res = await fetch(`${BACKEND_URL}/extract`, { method: "POST", body: forwarded });
      if (res.ok) {
        return Response.json(fromBackend((await res.json()) as BackendResponse), {
          headers: { "X-Extract-Mode": "live" },
        });
      }
    } catch {
      // backend unreachable — fall through to the mock
    }
  }

  await delay(ms);
  return Response.json(resultFor(name) ?? genericResult, {
    headers: { "X-Extract-Mode": "mock" },
  });
}
