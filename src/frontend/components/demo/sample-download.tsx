import { Download } from "lucide-react";
import { samples } from "@/lib/samples";

// Borderless rows: hover surface instead of an outlined button box.
export function SampleDownload() {
  return (
    <ul className="space-y-1">
      {samples.map((sample) => (
        <li key={sample.fileName}>
          <a
            href={`/samples/${sample.fileName}`}
            download={sample.fileName}
            className="group flex items-center gap-3 rounded-md px-3 py-2.5 transition-colors hover:bg-muted focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none"
          >
            <Download
              className="size-4 text-muted-foreground transition-colors group-hover:text-primary"
              aria-hidden
            />
            <span className="flex flex-col">
              <span className="text-sm font-medium">{sample.seller}</span>
              <span className="font-mono text-xs text-muted-foreground">{sample.fileName}</span>
            </span>
          </a>
        </li>
      ))}
    </ul>
  );
}
