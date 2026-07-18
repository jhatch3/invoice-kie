export function SiteFooter() {
  return (
    <footer className="border-t border-border/60">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-6 py-8 text-sm text-muted-foreground sm:flex-row">
        <p>invoice-kie — a demo UI for the invoice extraction pipeline.</p>
        <p>Benchmark figures are placeholders until the model is trained.</p>
      </div>
    </footer>
  );
}
