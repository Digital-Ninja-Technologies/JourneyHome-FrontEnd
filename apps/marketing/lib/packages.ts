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

const sample = (id: string, name: string, price: number, photo: boolean, video: boolean, coverage: string, deliverables: string[]): Package => ({
  _id: id, name, description: `${name} package`, photographyIncluded: photo, videographyIncluded: video, coverageDetails: coverage, deliverables,
  monthlyContributionMinor: price, currency: "NGN",
});

/** Shown when no backend is configured or reachable, so the site is still complete. Matches the design's packages. */
export const SAMPLE_PACKAGES: Package[] = [
  sample("sample-basic", "Basic", 500000, true, false, "Half-day photography", ["Half-day photography", "Digital gallery", "Dedicated coordinator"]),
  sample("sample-standard", "Standard", 1000000, true, true, "Full-day photography & video", ["Full-day photography & video", "Edited keepsake film", "Printed album, 40 pages", "Digital gallery for family abroad"]),
  sample("sample-premium", "Premium", 1800000, true, true, "Full-day, second camera", ["Everything in Standard", "Second videographer", "Drone coverage, where permitted", "Premium leather album"]),
];

/** Live packages from the API, or sample packages when the API isn't configured/reachable. */
export async function getPackages(): Promise<Package[] | null> {
  if (!API_URL) return SAMPLE_PACKAGES;
  try {
    const res = await fetch(`${API_URL}/packages`, { next: { revalidate: 300 } });
    if (!res.ok) return SAMPLE_PACKAGES;
    const json = await res.json();
    const list = json.data as Package[];
    return [...list].sort((a, b) => a.monthlyContributionMinor - b.monthlyContributionMinor);
  } catch {
    return SAMPLE_PACKAGES;
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
