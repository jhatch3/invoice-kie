import { FileText, CheckCircle2 } from "lucide-react";

const FIELDS: { label: string; value: string; strong?: boolean }[] = [
  { label: "Invoice #", value: "INV-2041" },
  { label: "Date", value: "Mar 14, 2026" },
  { label: "Subtotal", value: "$1,240.00" },
  { label: "Tax", value: "$99.20" },
  { label: "Total", value: "$1,339.20", strong: true },
];

// Static, decorative preview of an extraction result — the product's value at a glance.
export function HeroPreview() {
  return (
    <div className="relative mx-auto w-full max-w-sm">
      <div
        aria-hidden
        className="absolute -inset-4 -z-10 rounded-3xl bg-primary/20 blur-2xl"
      />
      <div className="overflow-hidden rounded-2xl border bg-card shadow-2xl ring-1 ring-foreground/10">
        <div className="flex items-center justify-between border-b bg-muted/40 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <FileText className="size-4 text-primary" aria-hidden />
            acme-invoice.pdf
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
            <CheckCircle2 className="size-3" aria-hidden />
            Extracted
          </span>
        </div>
        <dl className="divide-y">
          {FIELDS.map((field) => (
            <div key={field.label} className="flex items-center justify-between px-4 py-2.5">
              <dt className="text-sm text-muted-foreground">{field.label}</dt>
              <dd
                className={
                  field.strong
                    ? "text-sm font-semibold tabular-nums"
                    : "text-sm tabular-nums"
                }
              >
                {field.value}
              </dd>
            </div>
          ))}
        </dl>
        <div className="flex items-center justify-between border-t bg-muted/30 px-4 py-2.5 text-xs text-muted-foreground">
          <span>Confidence</span>
          <span className="font-medium text-foreground">97%</span>
        </div>
      </div>
    </div>
  );
}
