import type { Package } from "./types";

/** Money is stored in minor units (kobo for NGN). Kobo are shown only when present. */
export function formatMoney(minor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: minor % 100 === 0 ? 0 : 2,
  }).format(minor / 100);
}

export function packageSubtitle(p: Package) {
  return p.description.trim();
}

const INTERVAL_UNITS: Record<string, string> = {
  daily: "day",
  weekly: "week",
  monthly: "month",
  quarterly: "quarter",
  annually: "year",
  yearly: "year",
};

/** "monthly" → "month", for "₦10,000 / month". Unknown intervals are shown as sent. */
export function billingUnit(interval: string) {
  return INTERVAL_UNITS[interval] ?? interval;
}

export interface FeatureRow {
  label: string;
  /** Package ids that list this feature. */
  includedIn: Set<string>;
}

/**
 * Comparison rows built from the packages' own feature lists: one row per distinct
 * feature (case/whitespace-insensitive), in the order they first appear.
 */
export function featureMatrix(packages: Package[]): FeatureRow[] {
  const rows = new Map<string, FeatureRow>();
  for (const p of packages) {
    for (const raw of p.features) {
      const label = raw.trim();
      if (!label) continue;
      const key = label.toLowerCase().replace(/\s+/g, " ");
      const row = rows.get(key) ?? { label, includedIn: new Set<string>() };
      row.includedIn.add(p._id);
      rows.set(key, row);
    }
  }
  return [...rows.values()];
}
