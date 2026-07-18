import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { HeroPreview } from "./hero-preview";

export function Hero() {
  return (
    <section className="border-b border-border/60">
      <div className="grid items-center gap-14 px-6 py-20 sm:px-10 lg:grid-cols-[1.05fr_0.95fr] lg:px-16 lg:py-28">
        <div>
          <p className="text-sm font-medium text-primary">Invoice field extraction</p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
            Read every field off an invoice PDF, automatically.
          </h1>
          <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted-foreground text-pretty">
            invoice-kie pulls the total, tax, subtotal, date, and invoice number straight from a
            PDF using a fine-tuned LayoutLMv3 model, then checks itself against a zero-shot
            vision-language baseline.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Link href="/demo" className={buttonVariants({ size: "lg" })}>
              Run the demo
              <ArrowRight aria-hidden />
            </Link>
            <Link
              href="/#how-it-works"
              className={buttonVariants({ variant: "ghost", size: "lg" })}
            >
              See how it works
            </Link>
          </div>
        </div>

        <HeroPreview />
      </div>
    </section>
  );
}
