import { API_URL } from "./config";

export interface Package {
  _id: string;
  name: string;
  description: string;
  photographyIncluded: boolean;
  videographyIncluded: boolean;
  coverageDetails: string;
  deliverables: string[];
  monthlyContributionMinor: number;
  currency: string;
}

/** Returns null when the API is unreachable so pages can render a graceful fallback. */
export async function getPackages(): Promise<Package[] | null> {
  try {
    const res = await fetch(`${API_URL}/packages`, { next: { revalidate: 300 } });
    if (!res.ok) return null;
    const json = await res.json();
    const list = json.data as Package[];
    return [...list].sort((a, b) => a.monthlyContributionMinor - b.monthlyContributionMinor);
  } catch {
    return null;
  }
}

/** Money is stored in minor units (kobo for NGN). */
export function formatMoney(minor: number, currency = "NGN") {
  return new Intl.NumberFormat("en-NG", { style: "currency", currency, maximumFractionDigits: 0 }).format(minor / 100);
}

export function packageSubtitle(p: Package) {
  if (p.photographyIncluded && p.videographyIncluded) return "Photography + videography";
  if (p.photographyIncluded) return "Photography only";
  if (p.videographyIncluded) return "Videography only";
  return p.description;
}
