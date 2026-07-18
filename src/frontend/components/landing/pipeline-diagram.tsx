import { FileText, ScanText, Cpu, Braces } from "lucide-react";

const STAGES = [
  { icon: FileText, label: "PDF", desc: "Your invoice, exactly as it arrives." },
  { icon: ScanText, label: "OCR", desc: "Text plus where each token sits on the page." },
  { icon: Cpu, label: "LayoutLMv3", desc: "The model labels each field it recognizes." },
  { icon: Braces, label: "JSON", desc: "Clean, typed values you can use directly." },
] as const;

// A genuine four-step sequence, so numbered markers earn their place.
export function PipelineDiagram() {
  return (
    <section id="how-it-works" className="scroll-mt-20 border-t border-border/60 bg-muted/40">
      <div className="mx-auto max-w-6xl px-6 py-16">
        <h2 className="text-2xl font-semibold tracking-tight">How it works</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          Every PDF runs the same four stages, end to end.
        </p>
        <ol className="mt-10 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {STAGES.map((stage, i) => (
            <li key={stage.label}>
              <span className="font-mono text-xs font-medium text-primary">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div className="mt-3 flex items-center gap-2">
                <stage.icon className="size-4 text-muted-foreground" aria-hidden />
                <span className="font-medium tracking-tight">{stage.label}</span>
              </div>
              <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">{stage.desc}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
