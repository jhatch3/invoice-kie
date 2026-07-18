"use client";

import { Loader2 } from "lucide-react";

interface PdfViewerProps {
  url: string;
  fileName: string;
  scanning: boolean;
}

// Shows the uploaded PDF and, while a run is in flight, an ink "scan" pass.
export function PdfViewer({ url, fileName, scanning }: PdfViewerProps) {
  return (
    <div className="border border-border">
      <div className="flex items-center justify-between border-b border-border px-4 py-2.5 font-mono text-xs tracking-wide text-muted-foreground uppercase">
        <span>preview</span>
        <span className="truncate pl-4">{fileName}</span>
      </div>
      <div className="relative bg-muted/40">
        <iframe
          key={url}
          src={`${url}#toolbar=0&navpanes=0&view=FitH`}
          title={`Preview of ${fileName}`}
          className="h-[24rem] w-full"
        />
        {scanning && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="scan-line" />
            <div className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 border border-border bg-background px-3 py-1 font-mono text-xs tracking-wide uppercase">
              <Loader2 className="size-3 animate-spin" aria-hidden />
              Reading
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
