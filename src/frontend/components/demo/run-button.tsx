"use client";

import { Loader2, Play } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RunButtonProps {
  disabled?: boolean;
  pending?: boolean;
  onRun: () => void;
}

export function RunButton({ disabled, pending, onRun }: RunButtonProps) {
  return (
    <Button onClick={onRun} disabled={disabled || pending} size="lg">
      {pending ? (
        <>
          <Loader2 className="animate-spin" aria-hidden />
          Running…
        </>
      ) : (
        <>
          <Play aria-hidden />
          Run extraction
        </>
      )}
    </Button>
  );
}
