import { Skeleton } from "@journeyhome/ui/components/skeleton";
import { cn } from "@journeyhome/ui/lib/utils";

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
  showFeatures = true,
  className,
}: {
  count?: number;
  showFeatures?: boolean;
  className?: string;
}) {
  const featuredIndex = count === 3 ? 1 : -1;

  return (
    <div
      role="status"
      data-slot="package-cards-skeleton"
      className={cn("grid items-start gap-6 md:grid-cols-3", className)}
      aria-label="Loading packages..."
    >
      {Array.from({ length: count }).map((_, i) => {
        const isFeatured = i === featuredIndex;
        const key = SKELETON_KEYS[i] ?? `pkg-sk-${i}`;

        return (
          <div
            key={key}
            className={cn(
              "relative flex flex-col rounded-[28px] border-[1.5px] border-border bg-white",
              showFeatures ? "gap-[22px] p-9" : "gap-[18px] p-8",
            )}
          >
            {isFeatured && (
              <Skeleton className="absolute right-6 top-6 h-6 w-24 rounded-md" />
            )}

            <div>
              <Skeleton
                className={cn(
                  "rounded-md",
                  showFeatures ? "h-7 w-32" : "h-6 w-28",
                )}
              />
              <Skeleton className="mt-1.5 h-4 w-44 rounded-md" />
            </div>

            <div className="flex items-baseline gap-2">
              <Skeleton
                className={cn(
                  "rounded-md",
                  showFeatures ? "h-9 w-28" : "h-8 w-24",
                )}
              />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>

            <Skeleton className="h-[52px] w-full rounded-full" />

            {showFeatures && (
              <>
                <hr className="border-border" />
                <ul className="flex flex-col gap-3">
                  {["w-4/5", "w-3/5", "w-2/3", "w-1/2"].map((width) => (
                    <li key={width} className="flex items-center gap-2.5">
                      <Skeleton className="size-4 shrink-0 rounded-full" />
                      <Skeleton className={cn("h-4 rounded-md", width)} />
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
