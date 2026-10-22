import { createServerFn } from "@tanstack/react-start";
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

/**
 * Placeholder packages for the marketing site, mirroring the design mockups
 * (Pricing.dc.html for tiers/features, OnboardingPlan/CreatePlan/Plans.dc.html
 * for the ₦5,000 / ₦10,000 / ₦18,000 monthly amounts used throughout).
 * Used as fallback if the backend API is unreachable or returns invalid data.
 */
export const DUMMY_PACKAGES: Package[] = [
  {
    _id: "basic",
    name: "Basic",
    description: "Photography only",
    photographyIncluded: true,
    videographyIncluded: false,
    coverageDetails: "Half-day coverage",
    deliverables: ["Half-day photography", "Digital gallery", "Dedicated coordinator"],
    monthlyContributionMinor: 500_000,
    currency: "NGN",
  },
  {
    _id: "standard",
    name: "Standard",
    description: "Photography + videography",
    photographyIncluded: true,
    videographyIncluded: true,
    coverageDetails: "Full-day coverage",
    deliverables: [
      "Full-day photography & video",
      "Edited keepsake film",
      "Printed album, 40 pages",
      "Digital gallery for family abroad",
    ],
    monthlyContributionMinor: 1_000_000,
    currency: "NGN",
  },
  {
    _id: "premium",
    name: "Premium",
    description: "Full production",
    photographyIncluded: true,
    videographyIncluded: true,
    coverageDetails: "Full-day coverage, full production",
    deliverables: ["Everything in Standard", "Second videographer", "Drone coverage, where permitted", "Premium leather album"],
    monthlyContributionMinor: 1_800_000,
    currency: "NGN",
  },
];

function isValidPackage(p: unknown): p is Package {
  if (typeof p !== "object" || p === null) return false;
  const obj = p as Record<string, unknown>;
  return (
    typeof obj._id === "string" &&
    typeof obj.name === "string" &&
    typeof obj.monthlyContributionMinor === "number" &&
    typeof obj.currency === "string"
  );
}

interface CacheEntry {
  data: Package[];
  timestamp: number;
}

let packageCache: CacheEntry | null = null;
const CACHE_TTL_MS = 300 * 1000; // 5-minute in-memory cache TTL (300s)

/**
 * Server Function: fetches package pricing from the backend (/api/v1/packages)
 * on the server during SSR. Caches response in memory for 300s (5 minutes).
 * If the API is unreachable, gracefully falls back to design-approved dummy packages.
 */
export const fetchPackages = createServerFn({ method: "GET" }).handler(async () => {
  const now = Date.now();
  if (packageCache && now - packageCache.timestamp < CACHE_TTL_MS) {
    return packageCache.data;
  }

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000);
    const res = await fetch(`${API_URL}/packages`, {
      signal: controller.signal,
      headers: { Accept: "application/json" },
    });
    clearTimeout(timeout);

    if (res.ok) {
      const json = await res.json();
      const list = Array.isArray(json) ? json : json?.data;
      if (Array.isArray(list) && list.length > 0 && list.every(isValidPackage)) {
        const sorted = list.sort((a, b) => a.monthlyContributionMinor - b.monthlyContributionMinor);
        packageCache = { data: sorted, timestamp: now };
        return sorted;
      }
    }
  } catch {
    // Backend unreachable or offline; fallback cleanly
  }

  const fallback = [...DUMMY_PACKAGES].sort((a, b) => a.monthlyContributionMinor - b.monthlyContributionMinor);
  packageCache = { data: fallback, timestamp: now };
  return fallback;
});

export const getPackages = fetchPackages;

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
