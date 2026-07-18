"use client";

import type { ExtractionResult, RunStatus } from "@/lib/types";

function lit(value: string | number | null): string {
  if (value === null) return "null";
  return typeof value === "number" ? String(value) : `"${value}"`;
}

const LABEL: Record<RunStatus, string> = {
  idle: "waiting",
  running: "running",
  done: "ready",
  error: "error",
};

interface OutputJsonProps {
  fileName: string | null;
  seller: string | null;
  result: ExtractionResult | null;
  status: RunStatus;
}

export function OutputJson({ fileName, seller, result, status }: OutputJsonProps) {
  const json = `{
  "source_file": ${lit(fileName)},
  "vendor": ${lit(seller)},
  "fields": {
    "invoice_number": ${lit(result?.invoiceNumber ?? null)},
    "date": ${lit(result?.date ?? null)},
    "subtotal": ${lit(result?.subtotal ?? null)},
    "tax": ${lit(result?.tax ?? null)},
    "total": ${lit(result?.total ?? null)},
    "currency": ${lit(result?.currency ?? null)},
    "confidence": ${lit(result?.confidence ?? null)}
  }
}`;

  return (
    <div className="border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-xs tracking-wide text-muted-foreground uppercase">
        <span>output.json</span>
        <span>{LABEL[status]}</span>
      </div>
      <pre
        className={`overflow-x-auto px-4 py-4 font-mono text-xs leading-relaxed ${
          status === "done" ? "text-foreground" : "text-muted-foreground"
        }`}
      >
        {json}
      </pre>
    </div>
  );
}
