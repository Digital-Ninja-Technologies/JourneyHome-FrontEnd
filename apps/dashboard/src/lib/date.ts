/** `YYYY-MM-DD` (what `FormDatePicker` emits) → local midnight, or null if not a real date. */
export function parseDay(value: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (!m) return null;
  const [y, mo, d] = [Number(m[1]), Number(m[2]) - 1, Number(m[3])];
  const date = new Date(y, mo, d);
  const real =
    date.getFullYear() === y && date.getMonth() === mo && date.getDate() === d;
  return real ? date : null;
}

/** `YYYY-MM-DD` → the API's UTC-midnight ISO timestamp. */
export function dayToIso(value: string): string {
  return new Date(`${value}T00:00:00.000Z`).toISOString();
}
