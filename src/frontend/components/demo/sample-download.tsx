import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { samples } from "@/lib/samples";

// Server component: static list of downloadable sample invoices.
export function SampleDownload() {
  return (
    <ul className="flex flex-col gap-2">
      {samples.map((sample) => (
        <li key={sample.fileName}>
          <a
            href={`/samples/${sample.fileName}`}
            download={sample.fileName}
            className={buttonVariants({ variant: "outline", size: "lg" })}
          >
            <Download aria-hidden />
            {sample.seller} — {sample.fileName}
          </a>
        </li>
      ))}
    </ul>
  );
}
