"use client";

import { useState, type ChangeEvent, type DragEvent } from "react";
import { UploadCloud } from "lucide-react";
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
    e.target.value = ""; // allow re-selecting the same file
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
          "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-border bg-muted/30 p-8 text-center text-sm transition-colors hover:border-primary/60 focus-within:ring-3 focus-within:ring-ring/50",
          over && "border-primary bg-muted/60",
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
        <UploadCloud className="size-6 text-muted-foreground" aria-hidden />
        <span>
          Drag a PDF here, or <span className="font-medium text-primary">browse</span>
        </span>
        <span className="text-xs text-muted-foreground">PDF files only</span>
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
