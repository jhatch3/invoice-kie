import Link from "next/link";

const NAV = [
  { label: "Pipeline", href: "/#how-it-works" },
  { label: "Benchmark", href: "/#benchmark" },
  { label: "Try it", href: "/#try" },
  { label: "GitHub", href: "https://github.com/jhatch3" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/90 backdrop-blur">
      <div className="flex h-14 items-center justify-between px-6 sm:px-10 lg:px-16">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="font-display text-lg font-semibold tracking-tight">invoice-kie</span>
          <span className="font-mono text-xs text-muted-foreground">v01</span>
        </Link>
        <nav aria-label="Main" className="flex items-center gap-6 text-sm">
          {NAV.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="text-muted-foreground transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
    </header>
  );
}
