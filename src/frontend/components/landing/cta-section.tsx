import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="border-t border-border/60">
      <div className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-24">
        <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Watch it read an invoice
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
          Grab a sample PDF, drop it in, and watch the fields come out. No setup required, and it
          runs entirely in your browser.
        </p>
        <Link href="/demo" className={`mt-7 ${buttonVariants({ size: "lg" })}`}>
          Run the demo
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
