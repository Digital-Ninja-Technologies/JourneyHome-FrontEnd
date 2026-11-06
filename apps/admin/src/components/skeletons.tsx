import { Skeleton } from "@journeyhome/ui/components/skeleton";
import { cn } from "@journeyhome/ui/lib/utils";

/* -------------------------------------------------------------------------- */
/*                                   Basics                                   */
/* -------------------------------------------------------------------------- */

export function PageHeaderSkeleton({ actions = false }: { actions?: boolean }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-32 rounded-md" />
        <Skeleton className="h-12 w-64 rounded-xl" />
      </div>
      {actions && <Skeleton className="h-11 w-36 rounded-xl" />}
    </div>
  );
}

export function KpiRowSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }, (_, i) => `kpi-${i}`).map((key) => (
        <div
          key={key}
          className="flex flex-col gap-2 rounded-[20px] bg-white p-5 shadow-sm"
        >
          <Skeleton className="h-3.5 w-24 rounded" />
          <Skeleton className="h-8 w-32 rounded-lg" />
          <Skeleton className="h-3 w-20 rounded" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({
  className,
  lines = 3,
}: {
  className?: string;
  lines?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading…"
      className={cn(
        "flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm",
        className,
      )}
    >
      <Skeleton className="h-6 w-1/3 rounded-lg" />
      <div className="flex flex-col gap-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
            key={i}
            className={cn(
              "h-4 rounded-md",
              i === lines - 1 ? "w-2/3" : "w-full",
            )}
          />
        ))}
      </div>
    </div>
  );
}

/** Card-shaped table placeholder: toolbar, header row, body rows, footer. */
export function TableCardSkeleton({
  rows = 8,
  columns = 6,
}: {
  rows?: number;
  columns?: number;
}) {
  return (
    <div
      role="status"
      aria-label="Loading table…"
      className="overflow-hidden rounded-2xl border border-border/80 bg-white shadow-xs"
    >
      <div className="flex items-center justify-between gap-3 border-b border-border/60 p-3">
        <Skeleton className="h-10 w-full max-w-xs rounded-lg" />
        <Skeleton className="h-8 w-28 rounded-lg" />
      </div>
      <div className="flex flex-col divide-y divide-border/60">
        {Array.from({ length: rows }).map((_, r) => (
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
          <div key={r} className="flex items-center gap-6 px-4 py-3.5">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
                key={c}
                className={cn("h-4 flex-1 rounded-md", c === 0 && "max-w-40")}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between border-t border-border/60 px-4 py-3">
        <Skeleton className="h-4 w-36 rounded-md" />
        <Skeleton className="h-8 w-48 rounded-lg" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                                 Full views                                 */
/* -------------------------------------------------------------------------- */

export function TableViewSkeleton({ kpis = 0 }: { kpis?: number }) {
  return (
    <main role="status" aria-label="Loading…" className="flex flex-col gap-6">
      <PageHeaderSkeleton actions />
      {kpis > 0 && <KpiRowSkeleton count={kpis} />}
      <TableCardSkeleton />
    </main>
  );
}

export function DetailViewSkeleton() {
  return (
    <main role="status" aria-label="Loading…" className="flex flex-col gap-6">
      <PageHeaderSkeleton />
      <div className="grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 rounded-3xl bg-white p-7 sm:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton
              <div key={i} className="flex flex-col gap-1.5">
                <Skeleton className="h-3.5 w-20 rounded" />
                <Skeleton className="h-5 w-32 rounded-md" />
              </div>
            ))}
          </div>
          <CardSkeleton lines={4} />
        </div>
        <div className="flex flex-col gap-6">
          <CardSkeleton lines={2} />
          <CardSkeleton lines={3} />
        </div>
      </div>
    </main>
  );
}

export function OverviewSkeleton() {
  return (
    <main
      role="status"
      aria-label="Loading overview…"
      className="flex flex-col gap-8"
    >
      <PageHeaderSkeleton actions />
      <KpiRowSkeleton count={4} />
      <div className="grid gap-6 xl:grid-cols-[1.6fr_1fr]">
        <CardSkeleton lines={5} />
        <div className="flex flex-col gap-6">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      </div>
    </main>
  );
}

export function SettingsSkeleton() {
  return (
    <main
      role="status"
      aria-label="Loading settings…"
      className="flex max-w-[1000px] flex-col gap-6"
    >
      <PageHeaderSkeleton />
      <CardSkeleton lines={4} />
      <CardSkeleton lines={3} />
      <CardSkeleton lines={2} />
    </main>
  );
}
