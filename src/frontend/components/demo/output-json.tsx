"use client";

import type { ExtractMode } from "@/lib/extract-client";
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
  mode: ExtractMode | null;
}

export function OutputJson({ fileName, seller, result, status, mode }: OutputJsonProps) {
  const items = result?.lineItems ?? [];
  const itemLines =
    items.length === 0
      ? "[]"
      : "[\n" +
        items
          .map(
            (li) =>
              `      { "name": ${lit(li.name)}, "qty": ${lit(li.qty)}, ` +
              `"unit_price": ${lit(li.unitPrice)}, "price": ${lit(li.price)} }`,
          )
          .join(",\n") +
        "\n    ]";

  const json = `{
  "source_file": ${lit(fileName)},
  "vendor": ${lit(seller)},
  "fields": {
    "subtotal": ${lit(result?.subtotal ?? null)},
    "tax": ${lit(result?.tax ?? null)},
    "total": ${lit(result?.total ?? null)},
    "currency": ${lit(result?.currency ?? null)}
  },
  "line_items": ${itemLines}
}`;

  return (
    <div className="border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-xs tracking-wide text-muted-foreground uppercase">
        <span>output.json</span>
        <span className="flex items-center gap-3">
          {mode && status === "done" && (
            <span className={mode === "live" ? "text-foreground" : ""}>
              {mode === "live" ? "● live model" : "○ demo · mock"}
            </span>
          )}
          <span>{LABEL[status]}</span>
        </span>
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
