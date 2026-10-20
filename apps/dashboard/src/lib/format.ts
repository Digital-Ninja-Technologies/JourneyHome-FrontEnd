/** Money is stored in minor units (kobo for NGN). */
export function formatMoney(minor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100);
}

export const firstName = (full: string) => full.trim().split(/\s+/)[0] ?? full;

export const initials = (full: string) =>
  full.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const formatDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const formatDayLong = (d: Date) => `${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
export const formatToday = (d = new Date()) => `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;
export const formatMonthYear = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

export function greeting(d = new Date()) {
  const h = d.getHours();
  return h < 12 ? "Good morning" : h < 17 ? "Good afternoon" : "Good evening";
}

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

/** Whole days from today until the given date (negative when past). */
export function daysUntil(iso: string, now = new Date()) {
  return Math.round((startOfDay(new Date(iso)).getTime() - startOfDay(now).getTime()) / 86_400_000);
}

/** Next occurrence of a birthday (today counts) for a stored date of birth. */
export function nextBirthday(dobIso: string, now = new Date()) {
  const dob = new Date(dobIso);
  const today = startOfDay(now);
  let next = new Date(today.getFullYear(), dob.getUTCMonth(), dob.getUTCDate());
  if (next < today) next = new Date(today.getFullYear() + 1, dob.getUTCMonth(), dob.getUTCDate());
  return next;
}
