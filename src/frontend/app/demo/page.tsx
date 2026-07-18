import type { Metadata } from "next";
import { SampleDownload } from "@/components/demo/sample-download";
import { ExtractionWorkbench } from "@/components/demo/extraction-workbench";

export const metadata: Metadata = {
  title: "Demo — invoice-kie",
  description: "Download a sample invoice, upload it, and run the mock extraction pipeline.",
};

export default function DemoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 py-12">
      <h1 className="text-3xl font-semibold tracking-tight">Try the pipeline</h1>
      <p className="mt-2 max-w-2xl text-muted-foreground">
        Download a sample invoice, upload it back, and run it. Extraction is mocked in the browser
        for this demo — the results below mirror what the real model will return.
      </p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[280px_1fr]">
        <section aria-labelledby="download-heading">
          <h2 id="download-heading" className="text-sm font-semibold text-muted-foreground">
            1. Download a test invoice
          </h2>
          <div className="mt-3">
            <SampleDownload />
          </div>
        </section>

        <section aria-labelledby="run-heading">
          <h2 id="run-heading" className="text-sm font-semibold text-muted-foreground">
            2. Upload &amp; run
          </h2>
          <div className="mt-3">
            <ExtractionWorkbench />
          </div>
        </section>
      </div>
    </div>
  );
}
