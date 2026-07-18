"use client";

import { FileText, Loader2 } from "lucide-react";

interface PdfViewerProps {
  url: string;
  fileName: string;
  scanning: boolean;
}

// Shows the uploaded PDF and, while a run is in flight, an accent "scan" pass.
export function PdfViewer({ url, fileName, scanning }: PdfViewerProps) {
  return (
    <div className="overflow-hidden rounded-lg bg-card shadow-soft">
      <div className="flex items-center gap-2 border-b border-border/60 px-4 py-2.5 text-sm font-medium">
        <FileText className="size-4 text-muted-foreground" aria-hidden />
        {fileName}
      </div>
      <div className="relative bg-muted/40">
        <iframe
          key={url}
          src={`${url}#toolbar=0&navpanes=0&view=FitH`}
          title={`Preview of ${fileName}`}
          className="h-[26rem] w-full"
        />
        {scanning && (
          <div className="pointer-events-none absolute inset-0 overflow-hidden">
            <div className="absolute inset-0 bg-primary/5" />
            <div className="scan-line" />
            <div className="absolute bottom-3 left-1/2 inline-flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-background/90 px-3 py-1 text-xs font-medium shadow-soft">
              <Loader2 className="size-3 animate-spin text-primary" aria-hidden />
              Reading document…
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
