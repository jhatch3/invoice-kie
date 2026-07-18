import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function CtaSection() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-16">
      <div className="rounded-2xl border bg-card px-6 py-12 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">See the pipeline in action</h2>
        <p className="mx-auto mt-2 max-w-lg text-muted-foreground">
          Download a sample invoice, upload it, and watch the fields get extracted — all in your
          browser.
        </p>
        <Link href="/demo" className={`mt-6 ${buttonVariants({ size: "lg" })}`}>
          Try the demo
          <ArrowRight aria-hidden />
        </Link>
      </div>
    </section>
  );
}
