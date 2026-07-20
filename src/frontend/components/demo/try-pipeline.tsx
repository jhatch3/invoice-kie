import { DemoConsole } from "./demo-console";

export function TryPipeline() {
  return (
    <section
      id="try"
      className="flex min-h-[100svh] scroll-mt-14 flex-col justify-center px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-muted-foreground">§ 03</span>
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">
          Try the pipeline
        </h2>
      </div>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Pick a sample or upload your own receipt, then run it. With the backend running it calls the
        real model; otherwise a built-in mock keeps the demo working.
      </p>
      <p className="mt-2 font-mono text-xs text-muted-foreground">
        browser → Next.js /api/extract → FastAPI → LayoutLMv3
      </p>
      <div className="mt-12">
        <DemoConsole />
      </div>
    </section>
  );
}
