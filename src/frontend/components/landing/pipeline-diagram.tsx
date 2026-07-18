const STAGES = [
  {
    n: "01",
    title: "OCR",
    desc: "Tesseract (or PaddleOCR) yields tokens with pixel-space bounding boxes and reading order per page.",
  },
  {
    n: "02",
    title: "Layout-aware encode",
    desc: "LayoutLMv3 fuses word tokens with 2D positional embeddings and page image patches.",
  },
  {
    n: "03",
    title: "Token tagging",
    desc: "A fine-tuned head predicts BIO labels over the CORD header fields and line items.",
  },
  {
    n: "04",
    title: "Normalize",
    desc: "A post-processor resolves duplicates, parses amounts to numbers, and emits the target JSON.",
  },
] as const;

export function PipelineDiagram() {
  return (
    <section
      id="how-it-works"
      className="flex min-h-[100svh] scroll-mt-14 flex-col justify-center border-b border-border px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-muted-foreground">§ 01</span>
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          How it works
        </h2>
      </div>

      <ol className="mt-14 grid gap-x-8 gap-y-10 sm:grid-cols-2 lg:grid-cols-4">
        {STAGES.map((stage) => (
          <li key={stage.n} className="border-t border-foreground/25 pt-4">
            <span className="font-mono text-xs text-muted-foreground">{stage.n}</span>
            <h3 className="mt-3 font-display text-lg font-medium tracking-tight">{stage.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{stage.desc}</p>
          </li>
        ))}
      </ol>

      <p className="mt-14 font-mono text-sm text-muted-foreground">
        PDF → OCR (tokens + layout) → LayoutLMv3 token tagging → normalized JSON
      </p>
    </section>
  );
}
