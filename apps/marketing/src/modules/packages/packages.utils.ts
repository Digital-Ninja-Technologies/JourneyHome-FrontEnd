import type { Package } from "./types";

/** Money is stored in minor units (kobo for NGN). */
export function formatMoney(minor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}

export function packageSubtitle(p: Package) {
  return p.description ?? "";
}
