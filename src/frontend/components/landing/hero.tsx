import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { HeroPreview } from "./hero-preview";

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b">
      {/* Subtle brand glow behind the hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-[-10rem] -z-10 mx-auto h-[28rem] max-w-4xl rounded-full bg-primary/15 blur-3xl"
      />
      <div className="mx-auto grid max-w-5xl items-center gap-12 px-4 py-20 lg:grid-cols-2 lg:py-28">
        <div className="text-center lg:text-left">
          <span className="inline-flex items-center rounded-full border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur">
            Layout-aware invoice extraction
          </span>
          <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Turn invoice PDFs into{" "}
            <span className="text-primary">structured data</span>
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-lg text-muted-foreground text-pretty lg:mx-0">
            invoice-kie reads the total, tax, subtotal, date, and invoice number straight off a
            PDF — using a fine-tuned LayoutLMv3 model, benchmarked against a zero-shot
            vision-language model.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3 lg:justify-start">
            <Link href="/demo" className={buttonVariants({ size: "lg" })}>
              Try the demo
              <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/#how-it-works"
              className={buttonVariants({ variant: "outline", size: "lg" })}
            >
              How it works
            </Link>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}
