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
      "Every document comes back as normalized JSON: total, tax, subtotal, date, and invoice number.",
  },
  {
    icon: Gauge,
    title: "Fast and cheap",
    description:
      "A fine-tuned model matches the VLM's accuracy at a fraction of the latency and cost per document.",
  },
  {
    icon: ShieldCheck,
    title: "Benchmarked",
    description:
      "Measured on the public CORD and DocILE datasets against a zero-shot VLM baseline.",
  },
] as const;

export function FeatureGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-16">
      <div className="grid gap-x-10 gap-y-12 sm:grid-cols-2">
        {FEATURES.map((f) => (
          <FeatureCard key={f.title} icon={f.icon} title={f.title} description={f.description} />
        ))}
      </div>
    </section>
  );
}
