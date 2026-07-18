import { EMPTY } from "@/lib/format";

const ROWS = [{ model: "LayoutLMv3 (fine-tuned)" }, { model: "Zero-shot VLM" }] as const;
const COLUMNS = ["Macro F1", "Latency", "Cost / 1k docs"] as const;

// Blank on purpose. Real numbers land once the model is trained.
export function BenchmarkTable() {
  return (
    <section id="benchmarks" className="scroll-mt-20 border-t border-border/60 bg-muted/40">
      <div className="px-6 py-20 sm:px-10 lg:px-16">
        <p className="text-sm font-medium text-primary">Evaluation</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight">Benchmarks</h2>
        <p className="mt-2 max-w-xl text-muted-foreground">
          The table fills in once the model is trained and scored on the public CORD and DocILE
          datasets. It stays empty until those numbers are real.
        </p>

        <div className="mt-8 max-w-2xl overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border text-xs font-medium tracking-wide text-muted-foreground uppercase">
                <th scope="col" className="py-2.5 pr-4 text-left">
                  Model
                </th>
                {COLUMNS.map((col) => (
                  <th key={col} scope="col" className="px-4 py-2.5 text-right">
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/70">
              {ROWS.map((row) => (
                <tr key={row.model}>
                  <th scope="row" className="py-3 pr-4 text-left font-medium">
                    {row.model}
                  </th>
                  {COLUMNS.map((col) => (
                    <td
                      key={col}
                      className="px-4 py-3 text-right font-mono text-muted-foreground/70"
                    >
                      {EMPTY}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
