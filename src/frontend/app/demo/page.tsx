import type { Metadata } from "next";
import { SampleDownload } from "@/components/demo/sample-download";
import { ExtractionWorkbench } from "@/components/demo/extraction-workbench";

export const metadata: Metadata = {
  title: "invoice-kie demo",
  description: "Download a sample invoice, upload it, and run the extraction pipeline.",
};

export default function DemoPage() {
  return (
    <div className="px-6 py-14 sm:px-10 lg:px-16">
      <h1 className="text-3xl font-semibold tracking-tight">Run the pipeline</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Download a sample invoice, upload it back, and run it. Extraction is mocked in your browser
        for this demo. The fields mirror what the trained model will return.
      </p>

      <div className="mt-10 flex flex-col gap-10">
        <section aria-labelledby="download-heading">
          <h2 id="download-heading" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Step 1: Download a test invoice
          </h2>
          <div className="mt-3 max-w-md">
            <SampleDownload />
          </div>
        </section>

        <section aria-labelledby="run-heading">
          <h2 id="run-heading" className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Step 2: Upload and run
          </h2>
          <div className="mt-3">
            <ExtractionWorkbench />
          </div>
        </section>
      </div>
    </div>
  );
}
