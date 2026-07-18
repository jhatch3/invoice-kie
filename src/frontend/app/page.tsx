import { Hero } from "@/components/landing/hero";
import { FeatureGrid } from "@/components/landing/feature-grid";
import { PipelineDiagram } from "@/components/landing/pipeline-diagram";
import { BenchmarkTable } from "@/components/landing/benchmark-table";
import { CtaSection } from "@/components/landing/cta-section";

export default function Home() {
  return (
    <>
      <Hero />
      <FeatureGrid />
      <PipelineDiagram />
      <BenchmarkTable />
      <CtaSection />
    </>
  );
}
