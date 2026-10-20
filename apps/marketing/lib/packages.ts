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
 * Swap this for a real API call once a packages endpoint is deployed and
 * reachable from production — see lib/config.ts's API_URL.
 */
const DUMMY_PACKAGES: Package[] = [
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

/** Returns the packages to display. Static for now — see DUMMY_PACKAGES above. */
export async function getPackages(): Promise<Package[] | null> {
  return [...DUMMY_PACKAGES].sort((a, b) => a.monthlyContributionMinor - b.monthlyContributionMinor);
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
