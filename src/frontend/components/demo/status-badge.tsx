"use client";

import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RunStatus } from "@/lib/types";

// Muted semantic tints (tinted bg + same-hue text), not saturated solid fills.
const MAP: Record<RunStatus, { label: string; cls: string }> = {
  idle: { label: "Idle", cls: "bg-muted text-muted-foreground" },
  running: { label: "Running", cls: "bg-primary/10 text-primary" },
  done: { label: "Done", cls: "bg-success/10 text-success" },
  error: { label: "Error", cls: "bg-destructive/10 text-destructive" },
};

export function StatusBadge({ status }: { status: RunStatus }) {
  const { label, cls } = MAP[status];
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
        cls,
      )}
      data-status={status}
    >
      {status === "running" && <Loader2 className="size-3 animate-spin" aria-hidden />}
      {label}
    </span>
  );
}
