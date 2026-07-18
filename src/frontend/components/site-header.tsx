import Link from "next/link";
import { FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2 font-medium tracking-tight">
          <FileText className="size-5 text-primary" aria-hidden />
          invoice-kie
        </Link>
        <nav aria-label="Main" className="flex items-center gap-1 text-sm">
          <Link
            href="/#how-it-works"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            How it works
          </Link>
          <Link
            href="/#benchmarks"
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            Benchmarks
          </Link>
          <Link href="/demo" className={buttonVariants({ size: "sm" })}>
            Run the demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
