import { FileText, CheckCircle2 } from "lucide-react";

const FIELDS: { label: string; value: string; strong?: boolean }[] = [
  { label: "Invoice #", value: "INV-2041" },
  { label: "Date", value: "2026-03-14" },
  { label: "Subtotal", value: "$1,240.00" },
  { label: "Tax", value: "$99.20" },
  { label: "Total", value: "$1,339.20", strong: true },
];

// Opens the hero with the product's real artifact: a finished extraction.
export function HeroPreview() {
  return (
    <div className="rounded-xl bg-muted p-1.5 shadow-soft-lg">
      <div className="rounded-lg bg-card">
        <div className="flex items-center justify-between border-b border-border/60 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4 text-muted-foreground" aria-hidden />
            acme-invoice.pdf
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-success/10 px-2 py-0.5 text-xs font-medium text-success">
            <CheckCircle2 className="size-3" aria-hidden />
            Extracted
          </span>
        </div>
        <dl className="divide-y divide-border/60">
          {FIELDS.map((field) => (
            <div key={field.label} className="flex items-center justify-between px-4 py-2.5">
              <dt className="text-sm text-muted-foreground">{field.label}</dt>
              <dd
                className={
                  field.strong
                    ? "font-mono text-sm font-semibold tabular-nums"
                    : "font-mono text-sm tabular-nums"
                }
              >
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between px-4 py-3 text-xs text-muted-foreground">
          <span>Confidence</span>
          <span className="font-mono font-medium text-foreground">97%</span>
        </div>
      </div>
    </div>
  );
}
