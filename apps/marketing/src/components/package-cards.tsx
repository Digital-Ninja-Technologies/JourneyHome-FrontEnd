import { Button } from "@journeyhome/ui/components/button";
import { Skeleton } from "@journeyhome/ui/components/skeleton";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { Check, RefreshCw } from "lucide-react";
import {
  formatMoney,
  type Package,
  packageSubtitle,
} from "@/modules/packages/api";
import { SIGNUP_URL } from "../lib/config";

export function PackagesUnavailable({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="flex flex-col items-start gap-4 rounded-3xl border border-border bg-white p-8 text-muted">
      <p>
        Package pricing is temporarily unavailable. Please check back shortly or{" "}
        <Link to="/contact" className="font-bold text-link underline">
          contact us
        </Link>
        .
      </p>
      {onRetry && (
        <Button
          type="button"
          onClick={onRetry}
          variant="outline"
          size="sm"
          className="gap-2 rounded-full"
        >
          <RefreshCw className="size-3.5" />
          Try again
        </Button>
      )}
    </div>
  );
}

const SKELETON_KEYS = [
  "pkg-sk-basic",
  "pkg-sk-standard",
  "pkg-sk-premium",
  "pkg-sk-extra-1",
  "pkg-sk-extra-2",
  "pkg-sk-extra-3",
];

export function PackageCardsSkeleton({
  count = 3,
  showFeatures,
  className,
}: {
  count?: number;
  showFeatures?: boolean;
  className?: string;
}) {
  return (
    <div
      role="status"
      data-slot="package-cards-skeleton"
      className={cn("grid items-start gap-6 md:grid-cols-3", className)}
      aria-label="Loading packages..."
    >
      {Array.from({ length: count }).map((_, i) => {
        const isMiddle = count === 3 && i === 1;
        const key = SKELETON_KEYS[i] ?? `pkg-sk-${i}`;
        return (
          <div
            key={key}
            className={cn(
              "relative flex flex-col rounded-[28px] border-[1.5px] border-border bg-white",
              showFeatures ? "gap-[22px] p-9" : "gap-[18px] p-8",
              isMiddle && "ring-1 ring-border/50",
            )}
          >
            {isMiddle && showFeatures && (
              <Skeleton className="absolute right-6 top-6 h-5 w-24 rounded-md" />
            )}
            <div className="flex flex-col gap-2">
              <Skeleton
                className={cn(
                  "rounded-md",
                  showFeatures ? "h-7 w-36" : "h-6 w-32",
                )}
              />
              <Skeleton className="h-4 w-44 rounded-md" />
            </div>
            <div className="flex items-baseline gap-2">
              <Skeleton
                className={cn(
                  "rounded-md",
                  showFeatures ? "h-9 w-36" : "h-8 w-32",
                )}
              />
              <Skeleton className="h-4 w-14 rounded-md" />
            </div>
            <Skeleton className="h-[52px] w-full rounded-full" />
            {showFeatures && (
              <>
                <hr className="border-border" />
                <div className="flex flex-col gap-3">
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-4 shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-4/5 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-4 shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-3/5 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-4 shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-2/3 rounded-md" />
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Skeleton className="size-4 shrink-0 rounded-full" />
                    <Skeleton className="h-4 w-1/2 rounded-md" />
                  </div>
                </div>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}

/**
 * With three packages, the middle one is highlighted as "Most chosen" (as in the design).
 * The mockup uses slightly different card metrics for the Home teaser (compact, no features)
 * vs. the full Pricing cards (showFeatures) — padding, inner gap and price size scale up
 * accordingly to match Home.dc.html vs Pricing.dc.html exactly.
 */
export function PackageCards({
  packages,
  showFeatures,
}: {
  packages: Package[];
  showFeatures?: boolean;
}) {
  const featuredIndex = packages.length === 3 ? 1 : -1;
  return (
    <div className="grid items-start gap-6 md:grid-cols-3">
      {packages.map((p, i) => {
        const featured = i === featuredIndex;
        return (
          <div
            key={p._id}
            className={cn(
              "relative flex flex-col rounded-[28px] border-[1.5px]",
              showFeatures ? "gap-[22px] p-9" : "gap-[18px] p-8",
              featured
                ? "border-foreground bg-foreground text-canvas shadow-2xl"
                : "border-border bg-white",
            )}
          >
            {featured && (
              <span className="absolute right-6 top-6 rounded-md bg-accent px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                Most chosen
              </span>
            )}
            <div>
              <div
                className={cn(
                  "font-extrabold tracking-tight",
                  showFeatures ? "text-[22px]" : "text-[21px]",
                )}
              >
                {p.name}
              </div>
              <div
                className={cn(
                  "mt-1 text-sm",
                  featured ? "text-canvas/70" : "text-muted",
                )}
              >
                {packageSubtitle(p)}
              </div>
            </div>
            <div
              className={cn(
                "font-extrabold tracking-tight",
                showFeatures ? "text-[34px]" : "text-[30px]",
              )}
            >
              {formatMoney(p.amount, p.currency)}{" "}
              <span
                className={cn(
                  "text-sm font-medium",
                  featured ? "text-canvas/70" : "text-muted",
                )}
              >
                /{" "}
                {p.billingInterval === "monthly" ? "month" : p.billingInterval}
              </span>
            </div>
            <a
              href={SIGNUP_URL}
              className={cn(
                "inline-flex h-[52px] items-center justify-center rounded-full text-sm font-bold",
                featured
                  ? "bg-accent text-foreground"
                  : "border border-foreground",
              )}
            >
              Choose {p.name}
            </a>
            {showFeatures && (p.features?.length ?? 0) > 0 && (
              <>
                <hr
                  className={featured ? "border-canvas/15" : "border-border"}
                />
                <ul className="flex flex-col gap-3 text-sm">
                  {p.features?.map((d) => (
                    <li key={d} className="flex items-center gap-2.5">
                      <Check
                        className={cn(
                          "size-4 shrink-0",
                          featured ? "text-accent" : "text-status-active",
                        )}
                      />
                      {d}
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        );
      })}
    </div>
  );
}
