import { buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Check } from "lucide-react";
import { SIGNUP_URL } from "@/lib/config";
import { billingUnit, formatMoney, packageSubtitle } from "../packages.utils";
import type { Package } from "../types";

/**
 * Renders exactly what the API returns (name, description, price, currency, interval,
 * features). With three packages the middle card gets the dark treatment from the design;
 * that's layout only — there's no "most chosen" claim, since the API has no such data.
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
            <div>
              <div
                className={cn(
                  "font-extrabold tracking-tight",
                  showFeatures ? "text-[22px]" : "text-[21px]",
                )}
              >
                {p.name}
              </div>
              {packageSubtitle(p) && (
                <div
                  className={cn(
                    "mt-1 text-sm",
                    featured ? "text-canvas/70" : "text-muted-foreground",
                  )}
                >
                  {packageSubtitle(p)}
                </div>
              )}
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
                  featured ? "text-canvas/70" : "text-muted-foreground",
                )}
              >
                / {billingUnit(p.billingInterval)}
              </span>
            </div>
            <a
              href={`${SIGNUP_URL}?package=${encodeURIComponent(p._id)}`}
              className={cn(
                buttonVariants({
                  variant: featured ? "accent" : "outline",
                  size: "lg",
                }),
                "w-full font-bold",
                !featured &&
                  "border-foreground text-foreground hover:bg-foreground/5",
              )}
            >
              Choose {p.name}
            </a>
            {showFeatures && p.features.length > 0 && (
              <>
                <hr
                  className={featured ? "border-canvas/15" : "border-border"}
                />
                <ul className="flex flex-col gap-3 text-sm">
                  {p.features.map((d, i) => (
                    // Features are plain strings and may repeat; position is the identity.
                    // biome-ignore lint/suspicious/noArrayIndexKey: static list, never reordered client-side
                    <li key={`${i}-${d}`} className="flex items-center gap-2.5">
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
