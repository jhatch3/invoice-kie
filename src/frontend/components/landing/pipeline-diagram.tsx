import { FileText, ScanText, Braces, ArrowRight, Cpu } from "lucide-react";

const STAGES = [
  { icon: FileText, label: "PDF" },
  { icon: ScanText, label: "OCR (tokens + layout)" },
  { icon: Cpu, label: "LayoutLMv3 tagging" },
  { icon: Braces, label: "Normalized JSON" },
] as const;

export function PipelineDiagram() {
  return (
    <section id="how-it-works" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
      <h2 className="text-center text-2xl font-semibold tracking-tight">How it works</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
        Each invoice flows through four stages, end to end.
      </p>
      <ol className="mt-8 flex flex-col items-stretch justify-center gap-3 sm:flex-row sm:items-center">
        {STAGES.map((stage, i) => (
          <li key={stage.label} className="flex items-center gap-3">
            <div className="flex flex-1 items-center gap-3 rounded-lg border bg-card px-4 py-3">
              <span className="inline-flex size-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                <stage.icon className="size-4" aria-hidden />
              </span>
              <span className="text-sm font-medium">{stage.label}</span>
            </div>
            {i < STAGES.length - 1 && (
              <ArrowRight
                className="hidden size-5 shrink-0 text-muted-foreground sm:block"
                aria-hidden
              />
            )}
          </li>
        ))}
      </ol>
    </section>
  );
}
