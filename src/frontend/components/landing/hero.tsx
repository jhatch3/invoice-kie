import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function Hero() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-20 text-center">
      <span className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium text-muted-foreground">
        Layout-aware invoice extraction
      </span>
      <h1 className="mt-6 text-4xl font-semibold tracking-tight text-balance sm:text-5xl">
        Turn invoice PDFs into structured data
      </h1>
      <p className="mx-auto mt-4 max-w-2xl text-lg text-muted-foreground text-pretty">
        invoice-kie reads the total, tax, subtotal, date, and invoice number straight off a PDF —
        using a fine-tuned LayoutLMv3 model, benchmarked against a zero-shot vision-language model.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
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
    </section>
  );
}
