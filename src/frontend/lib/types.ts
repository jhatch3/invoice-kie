// Boundary types — the CORD target schema both the model and the VLM baseline emit.
// When the real backend lands, `ExtractionResult` will be generated from its OpenAPI schema.

export type RunStatus = "idle" | "running" | "done" | "error";

export interface LineItem {
  name: string | null;
  qty: number | null;
  unitPrice: number | null;
  price: number | null;
}

export interface ExtractionResult {
  subtotal: number | null;
  tax: number | null;
  total: number | null;
  currency: string;
  confidence: number; // 0..1
  lineItems: LineItem[];
}
