const ROWS = [
  { model: "LayoutLMv3 (fine-tuned)", ours: true, params: "133M", f1: "0.912", latency: "120 ms", cost: "$0.40" },
  { model: "Zero-shot GPT-4o", ours: false, params: "–", f1: "0.894", latency: "2.8 s", cost: "$12.10" },
  { model: "Zero-shot Qwen2-VL 7B", ours: false, params: "7B", f1: "0.851", latency: "1.4 s", cost: "$1.90" },
  { model: "Donut (baseline)", ours: false, params: "200M", f1: "0.803", latency: "310 ms", cost: "$0.55" },
] as const;

const COL = "px-4 py-3 text-right font-mono tabular-nums";
const COLHEAD = "px-4 py-2.5 text-right font-mono text-xs tracking-wide text-muted-foreground uppercase";

export function BenchmarkTable() {
  return (
    <section
      id="benchmark"
      className="flex min-h-[100svh] scroll-mt-14 flex-col justify-center border-b border-border px-6 py-20 sm:px-10 lg:px-16"
    >
      <div className="flex items-baseline gap-4">
        <span className="font-mono text-xs text-muted-foreground">§ 02</span>
        <h2 className="font-display text-4xl font-semibold tracking-tight sm:text-5xl">Benchmark</h2>
      </div>
      <p className="mt-4 max-w-2xl leading-relaxed text-muted-foreground">
        Held-out test split of CORD + DocILE invoices. Latency measured on a single A10G at batch
        size 1; cost priced against public API rates as of Q2 2026.
      </p>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/25">
              <th scope="col" className="px-4 py-2.5 text-left font-mono text-xs tracking-wide text-muted-foreground uppercase">
                Model
              </th>
              <th scope="col" className={COLHEAD}>Params</th>
              <th scope="col" className={COLHEAD}>Macro F1</th>
              <th scope="col" className={COLHEAD}>Latency</th>
              <th scope="col" className={COLHEAD}>Cost / 1k</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {ROWS.map((row) => (
              <tr key={row.model} className={row.ours ? "bg-muted/60" : undefined}>
                <th scope="row" className="px-4 py-4 text-left font-medium">
                  {row.model}
                  {row.ours && (
                    <span className="ml-2 font-mono text-xs tracking-wide text-muted-foreground uppercase">
                      ours
                    </span>
                  )}
                </th>
                <td className={`${COL} text-muted-foreground`}>{row.params}</td>
                <td className={`${COL} text-base`}>{row.f1}</td>
                <td className={`${COL} text-muted-foreground`}>{row.latency}</td>
                <td className={`${COL} text-muted-foreground`}>{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 font-mono text-xs text-muted-foreground">
        * Illustrative numbers for a portfolio demo. Full evaluation methodology and reproducible
        scripts live in the repo.
      </p>
    </section>
  );
}
