"use client";

import { Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import type { RunStatus } from "@/lib/types";

const MAP: Record<
  RunStatus,
  { label: string; variant: "outline" | "secondary" | "default" | "destructive" }
> = {
  idle: { label: "Idle", variant: "outline" },
  running: { label: "Running", variant: "secondary" },
  done: { label: "Done", variant: "default" },
  error: { label: "Error", variant: "destructive" },
};

export function StatusBadge({ status }: { status: RunStatus }) {
  const { label, variant } = MAP[status];
  return (
    <Badge variant={variant} data-status={status}>
      {status === "running" && <Loader2 className="animate-spin" aria-hidden />}
      {label}
    </Badge>
  );
}
