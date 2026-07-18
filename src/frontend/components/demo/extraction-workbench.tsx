"use client";

import { useEffect, useRef, useState } from "react";
import { UploadDropzone } from "./upload-dropzone";
import { RunButton } from "./run-button";
import { ExtractionTable } from "./extraction-table";
import { PdfViewer } from "./pdf-viewer";
import { useExtraction } from "@/lib/hooks/use-extraction";

export function ExtractionWorkbench() {
  const { rows, isPending, addFile, run } = useExtraction();
  // Files live outside React state (not serializable, not rendered).
  const files = useRef(new Map<string, File>());
  const [previewFile, setPreviewFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // Create/revoke an object URL for whichever file is being previewed.
  useEffect(() => {
    if (!previewFile) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(previewFile);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [previewFile]);

  function onFile(file: File) {
    const id = addFile(file.name);
    files.current.set(id, file);
    setPreviewFile(file);
  }

  async function onRun() {
    const idle = rows.filter((r) => r.status === "idle");
    for (const row of idle) {
      const file = files.current.get(row.id);
      if (file) {
        await run(row.id, file);
        files.current.delete(row.id);
      }
    }
  }

  const hasIdle = rows.some((r) => r.status === "idle");
  const last = rows[rows.length - 1];
  const announcement = isPending
    ? "Reading document…"
    : last?.status === "done"
      ? `Extraction complete for ${last.fileName}.`
      : last?.status === "error"
        ? `Extraction failed for ${last.fileName}.`
        : "";

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <UploadDropzone onFile={onFile} />
        <div>
          <RunButton disabled={!hasIdle} pending={isPending} onRun={onRun} />
        </div>
      </div>

      {previewUrl && previewFile && (
        <div className="grid gap-6 lg:grid-cols-[minmax(0,400px)_minmax(0,1fr)]">
          <PdfViewer url={previewUrl} fileName={previewFile.name} scanning={isPending} />
          <div className="min-w-0">
            <h3 className="mb-3 text-xs font-medium tracking-wide text-muted-foreground uppercase">
              Extracted fields
            </h3>
            <ExtractionTable rows={rows} />
          </div>
        </div>
      )}

      {!previewUrl && <ExtractionTable rows={rows} />}

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
