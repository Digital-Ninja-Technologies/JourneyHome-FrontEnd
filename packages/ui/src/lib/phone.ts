import {
  AsYouType,
  type CountryCode,
  parsePhoneNumberFromString,
} from "libphonenumber-js/max";

export type { CountryCode };

/** Numbers typed without a `+country` prefix are read as Nigerian by default. */
export const DEFAULT_PHONE_COUNTRY: CountryCode = "NG";

/** Keeps digits, plus a single leading `+` (so `+234…` international input works). */
function stripToDialable(raw: string): string {
  const trimmed = raw.trimStart();
  const hasPlus = trimmed.startsWith("+");
  // E.164 allows at most 15 digits.
  const digits = trimmed.replace(/\D/g, "").slice(0, 15);
  return hasPlus ? `+${digits}` : digits;
}

/** Formats as the user types: `08031234567` → `0803 123 4567`. */
export function formatPhoneInput(
  raw: string,
  country: CountryCode = DEFAULT_PHONE_COUNTRY,
): string {
  const dialable = stripToDialable(raw);
  if (!dialable) return "";
  return new AsYouType(country).input(dialable);
}

export function countDigitsBefore(value: string, caret: number): number {
  return value.slice(0, caret).replace(/\D/g, "").length;
}

/** Caret index in `formatted` that sits after the given number of digits. */
export function caretAfterDigits(formatted: string, digits: number): number {
  if (digits <= 0) return formatted.startsWith("+") ? 1 : 0;
  let seen = 0;
  for (let i = 0; i < formatted.length; i++) {
    if (/\d/.test(formatted[i])) seen++;
    if (seen === digits) return i + 1;
  }
  return formatted.length;
}

/** True only for numbers libphonenumber considers valid for their region. */
export function isValidPhone(
  value: string,
  country: CountryCode = DEFAULT_PHONE_COUNTRY,
): boolean {
  return parsePhoneNumberFromString(value, country)?.isValid() ?? false;
}

/** Canonical `+2348031234567` form for sending to the API, or null if unparseable. */
export function toE164(
  value: string,
  country: CountryCode = DEFAULT_PHONE_COUNTRY,
): string | null {
  return parsePhoneNumberFromString(value, country)?.number ?? null;
}

/**
 * Human-friendly rendering of a stored number: national style for Nigerian numbers
 * (`0803 123 4567`), international for everything else. Falls back to the raw value.
 */
export function formatPhoneDisplay(
  value: string,
  country: CountryCode = DEFAULT_PHONE_COUNTRY,
): string {
  const parsed = parsePhoneNumberFromString(value, country);
  if (!parsed) return value;
  return parsed.country === country
    ? parsed.formatNational()
    : parsed.formatInternational();
}
