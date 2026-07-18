import data from "./samples.json";
import type { ExtractionResult } from "./types";

export interface SampleRecord {
  fileName: string;
  seller: string;
  blurb: string;
  currency: string;
  lineItems: { name: string; qty: number | null; unit_price: number | null; price: number | null }[];
  subtotal: number;
  tax: number;
  total: number;
  confidence: number;
}

export const samples: SampleRecord[] = data as SampleRecord[];

export function toResult(sample: SampleRecord): ExtractionResult {
  return {
    subtotal: sample.subtotal,
    tax: sample.tax,
    total: sample.total,
    currency: sample.currency,
    confidence: sample.confidence,
    lineItems: sample.lineItems.map((li) => ({
      name: li.name,
      qty: li.qty,
      unitPrice: li.unit_price,
      price: li.price,
    })),
  };
}

/** Mock extraction result for a given uploaded filename, if it matches a known sample. */
export function resultFor(fileName: string): ExtractionResult | undefined {
  const match = samples.find((s) => s.fileName === fileName);
  return match ? toResult(match) : undefined;
}

/** Fallback used when an unknown file is uploaded. */
export const genericResult: ExtractionResult = {
  subtotal: 1000,
  tax: 80,
  total: 1080,
  currency: "USD",
  confidence: 0.82,
  lineItems: [{ name: "Item", qty: 1, unitPrice: 1000, price: 1000 }],
};
