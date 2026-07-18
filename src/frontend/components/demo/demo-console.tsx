"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UploadDropzone } from "./upload-dropzone";
import { PdfViewer } from "./pdf-viewer";
import { OutputJson } from "./output-json";
import { samples, type SampleRecord } from "@/lib/samples";
import { postExtract } from "@/lib/extract-client";
import { cn } from "@/lib/utils";
import type { ExtractionResult, RunStatus } from "@/lib/types";

interface Current {
  fileName: string;
  seller: string;
}

export function DemoConsole() {
  const [file, setFile] = useState<File | null>(null);
  const [current, setCurrent] = useState<Current | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [status, setStatus] = useState<RunStatus>("idle");
  const [result, setResult] = useState<ExtractionResult | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  function reset(next: File, currentInfo: Current) {
    setFile(next);
    setCurrent(currentInfo);
    setResult(null);
    setStatus("idle");
  }

  async function selectSample(sample: SampleRecord) {
    const res = await fetch(`/samples/${sample.fileName}`);
    const blob = await res.blob();
    reset(new File([blob], sample.fileName, { type: "application/pdf" }), {
      fileName: sample.fileName,
      seller: sample.seller,
    });
  }

  function onUpload(uploaded: File) {
    reset(uploaded, { fileName: uploaded.name, seller: "Uploaded document" });
  }

  async function run() {
    if (!file) return;
    setStatus("running");
    setResult(null);
    try {
      const extracted = await postExtract(file);
      setResult(extracted);
      setStatus("done");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      {/* Left: choose a document, then run */}
      <div className="flex flex-col gap-4">
        <p className="font-mono text-xs tracking-wide text-muted-foreground uppercase">
          Sample invoices
        </p>
        <ul className="flex flex-col gap-2">
          {samples.map((sample) => (
            <li
              key={sample.fileName}
              className={cn(
                "flex items-center justify-between gap-4 border px-4 py-4 transition-colors",
                current?.fileName === sample.fileName
                  ? "border-foreground"
                  : "border-border hover:border-foreground/40",
              )}
            >
              <button
                type="button"
                onClick={() => selectSample(sample)}
                className="flex-1 text-left"
              >
                <span className="block font-medium">{sample.seller}</span>
                <span className="block text-sm text-muted-foreground">{sample.blurb}</span>
              </button>
              <a
                href={`/samples/${sample.fileName}`}
                download={sample.fileName}
                className="font-mono text-xs whitespace-nowrap text-muted-foreground transition-colors hover:text-foreground"
              >
                PDF ↓
              </a>
            </li>
          ))}
        </ul>

        <UploadDropzone onFile={onUpload} />

        <Button
          type="button"
          size="lg"
          className="w-full"
          disabled={!file || status === "running"}
          onClick={run}
        >
          {status === "running" ? (
            <>
              <Loader2 className="animate-spin" aria-hidden />
              Running…
            </>
          ) : (
            "Run pipeline →"
          )}
        </Button>

        <p aria-live="polite" className="sr-only">
          {status === "running"
            ? "Running the pipeline."
            : status === "done"
              ? `Extraction complete for ${current?.fileName}.`
              : status === "error"
                ? "Extraction failed."
                : ""}
        </p>
      </div>

      {/* Right: preview + output */}
      <div className="flex flex-col gap-4">
        {previewUrl && current ? (
          <PdfViewer url={previewUrl} fileName={current.fileName} scanning={status === "running"} />
        ) : (
          <div className="flex h-[24rem] items-center justify-center border border-dashed border-border font-mono text-xs tracking-wide text-muted-foreground uppercase">
            Select a sample to preview
          </div>
        )}
        <OutputJson
          fileName={current?.fileName ?? null}
          seller={current?.seller ?? null}
          result={result}
          status={status}
        />
      </div>
    </div>
  );
}
