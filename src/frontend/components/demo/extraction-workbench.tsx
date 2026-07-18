"use client";

import { useRef } from "react";
import { UploadDropzone } from "./upload-dropzone";
import { RunButton } from "./run-button";
import { ExtractionTable } from "./extraction-table";
import { useExtraction } from "@/lib/hooks/use-extraction";

export function ExtractionWorkbench() {
  const { rows, isPending, addFile, run } = useExtraction();
  // Files are held outside React state (not serializable / not rendered).
  const files = useRef(new Map<string, File>());

  function onFile(file: File) {
    const id = addFile(file.name);
    files.current.set(id, file);
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
    ? "Running extraction…"
    : last?.status === "done"
      ? `Extraction complete for ${last.fileName}.`
      : last?.status === "error"
        ? `Extraction failed for ${last.fileName}.`
        : "";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-4">
        <UploadDropzone onFile={onFile} />
        <div>
          <RunButton disabled={!hasIdle} pending={isPending} onRun={onRun} />
        </div>
      </div>

      <ExtractionTable rows={rows} />

      <p role="status" aria-live="polite" className="sr-only">
        {announcement}
      </p>
    </div>
  );
}
