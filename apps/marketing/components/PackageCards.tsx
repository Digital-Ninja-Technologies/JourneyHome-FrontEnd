import { Check } from "lucide-react";
import { cn } from "@journeyhome/ui/lib/utils";
import { SIGNUP_URL } from "../lib/config";
import { formatMoney, packageSubtitle, type Package } from "../lib/packages";

export function PackagesUnavailable() {
  return (
    <div className="rounded-3xl border border-border bg-white p-8 text-muted">
      Package pricing is temporarily unavailable. Please check back shortly or{" "}
      <a href="/contact" className="font-bold text-link underline">
        contact us
      </a>
      .
    </div>
  );
}

/** With three packages, the middle one is highlighted as "Most chosen" (as in the design). */
export function PackageCards({ packages, showFeatures }: { packages: Package[]; showFeatures?: boolean }) {
  const featuredIndex = packages.length === 3 ? 1 : -1;
  return (
    <div className="grid items-start gap-5 md:grid-cols-3">
      {packages.map((p, i) => {
        const featured = i === featuredIndex;
        return (
          <div
            key={p._id}
            className={cn(
              "relative flex flex-col gap-5 rounded-[32px] border p-8",
              featured ? "border-foreground bg-foreground text-canvas shadow-2xl" : "border-border bg-white",
            )}
          >
            {featured && (
              <span className="absolute right-6 top-6 rounded-md bg-accent px-2.5 py-1 text-[11px] font-extrabold uppercase tracking-wider text-foreground">
                Most chosen
              </span>
            )}
            <div>
              <div className="text-2xl font-extrabold tracking-tight">{p.name}</div>
              <div className={cn("text-sm", featured ? "text-canvas/70" : "text-muted")}>{packageSubtitle(p)}</div>
            </div>
            <div className="text-4xl font-extrabold tracking-tight">
              {formatMoney(p.monthlyContributionMinor, p.currency)}{" "}
              <span className={cn("text-sm font-medium", featured ? "text-canvas/70" : "text-muted")}>/ month</span>
            </div>
            <a
              href={SIGNUP_URL}
              className={cn(
                "inline-flex h-[52px] items-center justify-center rounded-full text-sm font-bold",
                featured ? "bg-accent text-foreground" : "border border-foreground",
              )}
            >
              Choose {p.name}
            </a>
            {showFeatures && p.deliverables.length > 0 && (
              <>
                <hr className={featured ? "border-canvas/15" : "border-border"} />
                <ul className="flex flex-col gap-3 text-sm">
                  {p.deliverables.map((d) => (
                    <li key={d} className="flex items-center gap-2.5">
                      <Check className={cn("size-4 shrink-0", featured ? "text-accent" : "text-status-active")} />
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
