import type { Metadata } from "next";
import { TryPipeline } from "@/components/demo/try-pipeline";

export const metadata: Metadata = {
  title: "Try the pipeline — invoice-kie",
  description: "Pick a sample invoice or upload your own and run the extraction pipeline.",
};

export default function DemoPage() {
  return <TryPipeline />;
}
