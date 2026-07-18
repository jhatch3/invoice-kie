import { EM_DASH } from "@/lib/format";

const ROWS = [
  { model: "LayoutLMv3 (fine-tuned)" },
  { model: "Zero-shot VLM" },
] as const;

const COLUMNS = ["Macro F1", "Latency", "Cost / 1k docs"] as const;

// Blank stats on purpose — real numbers land once the pipeline is trained.
export function BenchmarkTable() {
  return (
    <section id="benchmarks" className="mx-auto max-w-5xl scroll-mt-20 px-4 py-12">
      <h2 className="text-center text-2xl font-semibold tracking-tight">Benchmarks</h2>
      <p className="mx-auto mt-2 max-w-xl text-center text-muted-foreground">
        Results will be published here once the model is trained and evaluated.
      </p>

      <div className="mx-auto mt-8 max-w-2xl overflow-x-auto rounded-lg border">
        <table className="w-full caption-bottom text-sm">
          <caption className="py-3 text-xs text-muted-foreground">
            Placeholder figures — numbers coming soon.
          </caption>
          <thead className="border-b bg-muted/40">
            <tr>
              <th scope="col" className="px-4 py-3 text-left font-medium">
                Model
              </th>
              {COLUMNS.map((col) => (
                <th key={col} scope="col" className="px-4 py-3 text-right font-medium">
                  {col}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row) => (
              <tr key={row.model} className="border-b last:border-0">
                <th scope="row" className="px-4 py-3 text-left font-medium">
                  {row.model}
                </th>
                {COLUMNS.map((col) => (
                  <td key={col} className="px-4 py-3 text-right text-muted-foreground">
                    {EM_DASH}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
