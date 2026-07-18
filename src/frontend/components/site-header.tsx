import Link from "next/link";
import { FileText } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b bg-background/80 backdrop-blur">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
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
          <Link href="/demo" className={buttonVariants({ variant: "default", size: "sm" })}>
            Try the demo
          </Link>
        </nav>
      </div>
    </header>
  );
}
