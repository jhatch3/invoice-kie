import { ScanText, Gauge, Braces, ShieldCheck } from "lucide-react";
import { FeatureCard } from "./feature-card";

const FEATURES = [
  {
    icon: ScanText,
    title: "Layout-aware",
    description:
      "LayoutLMv3 reads position and text together, so it finds fields even in messy invoice layouts.",
  },
  {
    icon: Braces,
    title: "Structured output",
    description:
      "Every document becomes clean, normalized JSON: total, tax, subtotal, date, and invoice number.",
  },
  {
    icon: Gauge,
    title: "Fast & cheap",
    description:
      "A fine-tuned model matches VLM accuracy at a fraction of the latency and cost per document.",
  },
  {
    icon: ShieldCheck,
    title: "Benchmarked",
    description:
      "Evaluated on public invoice datasets (CORD, DocILE) against a zero-shot VLM baseline.",
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-5xl px-4 py-12">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
        ))}
      </div>
    </section>
  );
}
