/** Money is stored in minor units (kobo for NGN). */
export function formatMoney(minor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100);
}

/** Compact money for big totals, e.g. ₦18.6M. */
export function formatMoneyCompact(minor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, notation: "compact", maximumFractionDigits: 1 }).format(minor / 100);
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const MONTHS_LONG = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
const WEEKDAYS = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

export const formatDay = (iso: string) => {
  const d = new Date(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
};
export const formatDate = (iso: string) => `${formatDay(iso)} ${new Date(iso).getFullYear()}`;
export const formatDateTime = (iso: string) => {
  const d = new Date(iso);
  const h = d.getHours();
  return `${formatDay(iso)}, ${((h + 11) % 12) + 1}:${String(d.getMinutes()).padStart(2, "0")}${h < 12 ? "am" : "pm"}`;
};
export const formatMonthYear = (iso: string) => {
  const d = new Date(iso);
  return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};
export const formatToday = (d = new Date()) => `${WEEKDAYS[d.getDay()]}, ${d.getDate()} ${MONTHS_LONG[d.getMonth()]}`;

export const initials = (full: string) =>
  full.trim().split(/\s+/).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

export const capitalise = (s: string) => (s ? s[0].toUpperCase() + s.slice(1) : s);

export function ageFrom(dobIso: string, now = new Date()) {
  const dob = new Date(dobIso);
  let age = now.getFullYear() - dob.getUTCFullYear();
  if (now.getMonth() < dob.getUTCMonth() || (now.getMonth() === dob.getUTCMonth() && now.getDate() < dob.getUTCDate())) age--;
  return age;
}

export const isThisMonth = (iso: string, now = new Date()) => {
  const d = new Date(iso);
  return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
};
