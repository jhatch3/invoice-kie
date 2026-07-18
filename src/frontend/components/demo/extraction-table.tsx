"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { StatusBadge } from "./status-badge";
import { formatCurrency, formatDate, formatConfidence, EMPTY } from "@/lib/format";
import type { RunRow } from "@/lib/types";

const HEAD = "text-xs font-medium tracking-wide text-muted-foreground uppercase";
const NUM = "text-right font-mono tabular-nums";

export function ExtractionTable({ rows }: { rows: RunRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg bg-muted/50 px-6 py-10 text-center text-sm text-muted-foreground">
        Upload a sample above and run it. The extracted fields will show up here.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow className="hover:bg-transparent">
          <TableHead className={HEAD}>File</TableHead>
          <TableHead className={HEAD}>Invoice #</TableHead>
          <TableHead className={HEAD}>Date</TableHead>
          <TableHead className={`${HEAD} text-right`}>Subtotal</TableHead>
          <TableHead className={`${HEAD} text-right`}>Tax</TableHead>
          <TableHead className={`${HEAD} text-right`}>Total</TableHead>
          <TableHead className={`${HEAD} text-right`}>Confidence</TableHead>
          <TableHead className={HEAD}>Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const currency = row.result?.currency ?? "USD";
          return (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.fileName}</TableCell>
              <TableCell className="font-mono">{row.result?.invoiceNumber ?? EMPTY}</TableCell>
              <TableCell className="font-mono tabular-nums">
                {formatDate(row.result?.date ?? null)}
              </TableCell>
              <TableCell className={NUM}>
                {formatCurrency(row.result?.subtotal ?? null, currency)}
              </TableCell>
              <TableCell className={NUM}>
                {formatCurrency(row.result?.tax ?? null, currency)}
              </TableCell>
              <TableCell className={`${NUM} font-medium`}>
                {formatCurrency(row.result?.total ?? null, currency)}
              </TableCell>
              <TableCell className={`${NUM} text-muted-foreground`}>
                {formatConfidence(row.result?.confidence ?? null)}
              </TableCell>
              <TableCell>
                <StatusBadge status={row.status} />
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
}
