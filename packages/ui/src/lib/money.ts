/**
 * Helpers for money typed into a text field. The field shows the amount grouped with
 * commas (`1,250,000.50`); `parseMoneyInput` turns that back into a plain number for the API.
 */

const MAX_DECIMALS = 2;

/** Formats raw input as the user types: keeps digits and one `.`, groups thousands, caps decimals. */
export function formatMoneyInput(raw: string): string {
  const cleaned = raw.replace(/[^\d.]/g, "");
  if (!cleaned) return "";

  const dot = cleaned.indexOf(".");
  const intRaw = dot === -1 ? cleaned : cleaned.slice(0, dot);
  const decimals =
    dot === -1
      ? undefined
      : cleaned
          .slice(dot + 1)
          .replace(/\./g, "")
          .slice(0, MAX_DECIMALS);

  // Drop leading zeros, but keep a single "0" so "0.5" and "0" still read correctly.
  const int =
    intRaw.replace(/^0+(?=\d)/, "") || (decimals !== undefined ? "0" : "");
  const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  return decimals === undefined ? grouped : `${grouped}.${decimals}`;
}

/** Strips formatting and returns the number, or `NaN` when nothing numeric was entered. */
export function parseMoneyInput(
  value: string | number | null | undefined,
): number {
  if (typeof value === "number") return value;
  const cleaned = (value ?? "").replace(/[^\d.]/g, "");
  if (!cleaned || cleaned === ".") return Number.NaN;
  return Math.round(Number(cleaned) * 10 ** MAX_DECIMALS) / 10 ** MAX_DECIMALS;
}

/** Formats a number for the field, e.g. when loading an existing value into a form. */
export function toMoneyInput(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "";
  return formatMoneyInput(String(value));
}

/** Counts characters that survive formatting (digits and `.`) before the caret. */
export function countMoneyCharsBefore(value: string, caret: number): number {
  return value.slice(0, caret).replace(/[^\d.]/g, "").length;
}

/** Caret index in `formatted` that sits after the given number of digits/`.` characters. */
export function caretAfterMoneyChars(formatted: string, count: number): number {
  if (count <= 0) return 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/[\d.]/.test(formatted[i])) seen++;
    if (seen === count) return i + 1;
  }
  return formatted.length;
}
