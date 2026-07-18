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
import { formatCurrency, formatDate, formatConfidence, EM_DASH } from "@/lib/format";
import type { RunRow } from "@/lib/types";

export function ExtractionTable({ rows }: { rows: RunRow[] }) {
  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-8 text-center text-sm text-muted-foreground">
        No invoices yet. Download a sample above, then upload it to see the extracted fields.
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead scope="col">File</TableHead>
          <TableHead scope="col">Invoice #</TableHead>
          <TableHead scope="col">Date</TableHead>
          <TableHead scope="col" className="text-right">
            Subtotal
          </TableHead>
          <TableHead scope="col" className="text-right">
            Tax
          </TableHead>
          <TableHead scope="col" className="text-right">
            Total
          </TableHead>
          <TableHead scope="col" className="text-right">
            Confidence
          </TableHead>
          <TableHead scope="col">Status</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.map((row) => {
          const currency = row.result?.currency ?? "USD";
          return (
            <TableRow key={row.id}>
              <TableCell className="font-medium">{row.fileName}</TableCell>
              <TableCell>{row.result?.invoiceNumber ?? EM_DASH}</TableCell>
              <TableCell>{formatDate(row.result?.date ?? null)}</TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.result?.subtotal ?? null, currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
                {formatCurrency(row.result?.tax ?? null, currency)}
              </TableCell>
              <TableCell className="text-right font-medium tabular-nums">
                {formatCurrency(row.result?.total ?? null, currency)}
              </TableCell>
              <TableCell className="text-right tabular-nums">
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
