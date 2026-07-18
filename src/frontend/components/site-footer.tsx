import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border">
      <div className="flex flex-col items-center justify-between gap-2 px-6 py-8 font-mono text-xs text-muted-foreground sm:flex-row sm:px-10 lg:px-16">
        <p>invoice-kie · MIT · Built by Justin Hatch</p>
        <div className="flex items-center gap-6">
          <Link href="https://github.com/jhatch3" className="transition-colors hover:text-foreground">
            GitHub
          </Link>
          <Link href="#top" className="transition-colors hover:text-foreground">
            Back to top ↑
          </Link>
        </div>
      </div>
    </footer>
  );
}
