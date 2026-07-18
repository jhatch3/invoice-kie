import { Hero } from "@/components/landing/hero";
import { PipelineDiagram } from "@/components/landing/pipeline-diagram";
import { BenchmarkTable } from "@/components/landing/benchmark-table";
import { TryPipeline } from "@/components/demo/try-pipeline";

export default function Home() {
  return (
    <>
      <Hero />
      <PipelineDiagram />
      <BenchmarkTable />
      <TryPipeline />
    </>
  );
}
