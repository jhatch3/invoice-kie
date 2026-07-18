// Placeholder for an absent value (never an em dash).
export const EMPTY = "·";

export function formatCurrency(value: number | null, currency: string): string {
  if (value === null) return EMPTY;
  return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(value);
}

export function formatDate(iso: string | null): string {
  if (iso === null) return EMPTY;
  // Parse as UTC so a date-only string doesn't drift across timezones.
  const date = new Date(`${iso}T00:00:00Z`);
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(date);
}

export function formatConfidence(value: number | null): string {
  if (value === null) return EMPTY;
  return `${Math.round(value * 100)}%`;
}
