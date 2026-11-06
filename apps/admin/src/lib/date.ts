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

/** Local date → `YYYY-MM-DD`. */
export function toDay(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

/** First and last day of the month containing `d`, as `YYYY-MM-DD`. */
export function monthRange(d = new Date()) {
  return {
    startDate: toDay(new Date(d.getFullYear(), d.getMonth(), 1)),
    endDate: toDay(new Date(d.getFullYear(), d.getMonth() + 1, 0)),
  };
}

export const PERIOD_PRESETS = [
  { value: "this_month", label: "This month" },
  { value: "last_month", label: "Last month" },
  { value: "last_30", label: "Last 30 days" },
  { value: "last_90", label: "Last 90 days" },
  { value: "this_year", label: "This year" },
] as const;
export type PeriodPreset = (typeof PERIOD_PRESETS)[number]["value"];

/** `YYYY-MM-DD` start/end for a preset, relative to `now`. */
export function presetRange(
  preset: PeriodPreset,
  now = new Date(),
): { from: string; to: string } {
  const y = now.getFullYear();
  const m = now.getMonth();
  const daysBack = (n: number) => new Date(y, m, now.getDate() - (n - 1));
  switch (preset) {
    case "this_month":
      return {
        from: toDay(new Date(y, m, 1)),
        to: toDay(new Date(y, m + 1, 0)),
      };
    case "last_month":
      return {
        from: toDay(new Date(y, m - 1, 1)),
        to: toDay(new Date(y, m, 0)),
      };
    case "last_30":
      return { from: toDay(daysBack(30)), to: toDay(now) };
    case "last_90":
      return { from: toDay(daysBack(90)), to: toDay(now) };
    case "this_year":
      return { from: toDay(new Date(y, 0, 1)), to: toDay(new Date(y, 11, 31)) };
  }
}

/** The preset a from/to pair corresponds to, if any. */
export function matchPreset(
  from: string | undefined,
  to: string | undefined,
  now = new Date(),
): PeriodPreset | undefined {
  if (!from || !to) return undefined;
  return PERIOD_PRESETS.find((p) => {
    const r = presetRange(p.value, now);
    return r.from === from && r.to === to;
  })?.value;
}
