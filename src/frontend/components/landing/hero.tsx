import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { HeroStats } from "./hero-stats";

export function Hero() {
  return (
    <section
      id="top"
      className="flex min-h-[calc(100svh-3.5rem)] flex-col justify-center border-b border-border px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="flex items-center gap-3 font-mono text-xs tracking-widest text-muted-foreground uppercase">
        <span className="h-px w-8 bg-border" aria-hidden />
        Key information extraction · receipts → JSON
      </div>

      <h1 className="mt-8 max-w-4xl font-display text-5xl font-semibold tracking-tight text-balance sm:text-6xl lg:text-7xl lg:leading-[0.98]">
        A fine-tuned LayoutLMv3 pipeline that reads documents at a fraction of the cost of a VLM.
      </h1>

      <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
        invoice-kie extracts subtotal, tax, total, and line items from receipt documents (CORD),
        and benchmarks the fine-tuned model against a zero-shot Qwen2-VL baseline on accuracy,
        latency, and estimated cost. The method transfers to invoices.
      </p>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        <Link href="/#try" className={buttonVariants({ size: "lg" })}>
          Try the pipeline
          <ArrowRight aria-hidden />
        </Link>
        <Link href="/#benchmark" className={buttonVariants({ variant: "outline", size: "lg" })}>
          See the numbers
        </Link>
      </div>

      <div className="mt-16">
        <HeroStats />
        <p className="mt-4 font-mono text-xs text-muted-foreground">
          Illustrative figures — measured for real once the model is evaluated.
        </p>
      </div>
    </section>
  );
}
