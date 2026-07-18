"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { cn } from "@/lib/utils";

function isPdf(file: File): boolean {
  return file.type === "application/pdf" || file.name.toLowerCase().endsWith(".pdf");
}

export function UploadDropzone({ onFile }: { onFile: (file: File) => void }) {
  const [error, setError] = useState<string | null>(null);
  const [over, setOver] = useState(false);

  function handle(file: File | undefined) {
    if (!file) return;
    if (!isPdf(file)) {
      setError("Please choose a PDF file.");
      return;
    }
    setError(null);
    onFile(file);
  }

  function onChange(e: ChangeEvent<HTMLInputElement>) {
    handle(e.target.files?.[0]);
    e.target.value = "";
  }

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setOver(false);
    handle(e.dataTransfer.files?.[0]);
  }

  return (
    <div>
      <label
        className={cn(
          "flex cursor-pointer items-center justify-center gap-2 border border-dashed border-border px-4 py-5 text-center font-mono text-xs tracking-wide text-muted-foreground uppercase transition-colors hover:border-foreground/50 focus-within:border-foreground",
          over && "border-foreground bg-muted/50",
        )}
        onDragOver={(e) => {
          e.preventDefault();
          setOver(true);
        }}
        onDragLeave={(e) => {
          e.preventDefault();
          setOver(false);
        }}
        onDrop={onDrop}
      >
        or drop your own PDF
        <input
          type="file"
          accept="application/pdf,.pdf"
          className="sr-only"
          aria-label="Upload a PDF invoice"
          onChange={onChange}
        />
      </label>
      {error && (
        <p role="alert" className="mt-2 text-sm text-destructive">
          {error}
        </p>
      )}
    </div>
  );
}
