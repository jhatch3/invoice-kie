const ROWS = [
  { model: "LayoutLMv3 (fine-tuned)", ours: true, params: "133M", field: "0.912", line: "0.86", latency: "120 ms", cost: "$0.40" },
  { model: "Qwen2-VL 7B (zero-shot)", ours: false, params: "7B", field: "0.874", line: "0.79", latency: "1.4 s", cost: "$1.90" },
  { model: "Donut (baseline)", ours: false, params: "200M", field: "0.803", line: "0.71", latency: "310 ms", cost: "$0.55" },
] as const;

const COLHEAD = "px-4 py-2.5 text-right font-mono text-xs tracking-wide text-muted-foreground uppercase";
const COL = "px-4 py-3 text-right font-mono tabular-nums";

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
        Held-out CORD test split (100 receipts). Latency measured at batch size 1 on a single GPU;
        cost is an estimate from GPU-time, not real API spend.
      </p>

      <div className="mt-12 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-foreground/25">
              <th scope="col" className="px-4 py-2.5 text-left font-mono text-xs tracking-wide text-muted-foreground uppercase">
                Model
              </th>
              <th scope="col" className={COLHEAD}>Params</th>
              <th scope="col" className={COLHEAD}>Field F1</th>
              <th scope="col" className={COLHEAD}>Line-item F1</th>
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
                <td className={`${COL} text-base`}>{row.field}</td>
                <td className={`${COL} text-muted-foreground`}>{row.line}</td>
                <td className={`${COL} text-muted-foreground`}>{row.latency}</td>
                <td className={`${COL} text-muted-foreground`}>{row.cost}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="mt-8 font-mono text-xs text-muted-foreground">
        * Illustrative placeholders until the eval harness (Phase 3) emits real results.json.
      </p>
    </section>
  );
}
