import { Skeleton } from "@journeyhome/ui/components/skeleton";
import { cn } from "@journeyhome/ui/lib/utils";

/* -------------------------------------------------------------------------- */
/*                               Basic Skeletons                              */
/* -------------------------------------------------------------------------- */

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
      aria-label="Loading card..."
      className={cn(
        "flex flex-col gap-3 rounded-3xl border border-border bg-white p-6 shadow-sm",
        className,
      )}
    >
      <div className="flex items-center justify-between">
        <Skeleton className="h-6 w-1/3 rounded-lg" />
        <Skeleton className="h-5 w-16 rounded-full" />
      </div>
      <div className="flex flex-col gap-2 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
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

export function TableSkeleton({
  rows = 4,
  columns = 4,
  className,
}: {
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div
      role="status"
      aria-label="Loading table..."
      className={cn(
        "flex flex-col gap-3 overflow-hidden rounded-3xl bg-white p-6",
        className,
      )}
    >
      <div className="flex items-center justify-between border-b border-border/80 pb-3">
        {Array.from({ length: columns }).map((_, c) => (
          <Skeleton key={c} className="h-4 w-20 rounded-md" />
        ))}
      </div>
      <div className="flex flex-col gap-3.5 pt-1">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex items-center justify-between gap-4">
            {Array.from({ length: columns }).map((_, c) => (
              <Skeleton
                key={c}
                className={cn("h-4 rounded-md", c === 0 ? "w-32" : "w-20")}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                               Plans Skeletons                              */
/* -------------------------------------------------------------------------- */

export function PlansCardsSkeleton({ count = 2 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading plans..."
      className="grid gap-4 sm:grid-cols-2"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col justify-between gap-4 rounded-3xl border border-border bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-6 w-36 rounded-lg" />
              <Skeleton className="h-4 w-24 rounded-md" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>

          <div className="flex flex-col gap-2 rounded-2xl bg-canvas p-4">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
            <Skeleton className="h-2.5 w-full rounded-full" />
            <div className="flex justify-between pt-1">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-3.5 w-20 rounded" />
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-2">
            <Skeleton className="h-10 w-28 rounded-xl" />
            <Skeleton className="h-10 w-28 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PlanDetailSkeleton() {
  return (
    <main
      role="status"
      aria-label="Loading plan details..."
      className="flex flex-col gap-6 p-4 sm:p-6 md:p-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-32 rounded-md" />
          <div className="flex items-center gap-3">
            <Skeleton className="h-9 w-48 rounded-xl" />
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
        <div className="flex gap-3">
          <Skeleton className="h-11 w-32 rounded-xl" />
          <Skeleton className="h-11 w-36 rounded-xl" />
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 md:col-span-2">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <div className="grid gap-4 sm:grid-cols-2 pt-2">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-5 w-32 rounded-md" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-5 w-28 rounded-md" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-24 rounded" />
              <Skeleton className="h-5 w-36 rounded-md" />
            </div>
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-3.5 w-20 rounded" />
              <Skeleton className="h-5 w-24 rounded-md" />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-4 rounded-3xl bg-foreground p-6 text-canvas">
          <Skeleton className="h-6 w-28 rounded-lg bg-canvas/20" />
          <div className="flex flex-col gap-3 pt-2">
            <Skeleton className="h-4 w-full rounded-md bg-canvas/15" />
            <Skeleton className="h-4 w-3/4 rounded-md bg-canvas/15" />
            <Skeleton className="mt-2 h-11 w-full rounded-xl bg-canvas/20" />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-36 rounded-lg" />
          <Skeleton className="h-4 w-20 rounded-md" />
        </div>
        <div className="flex flex-col gap-3 pt-2">
          {Array.from({ length: 3 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center justify-between border-b border-border/60 pb-3"
            >
              <div className="flex flex-col gap-1">
                <Skeleton className="h-4 w-32 rounded-md" />
                <Skeleton className="h-3.5 w-24 rounded" />
              </div>
              <Skeleton className="h-5 w-20 rounded-md" />
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

/* -------------------------------------------------------------------------- */
/*                              Payments Skeletons                            */
/* -------------------------------------------------------------------------- */

export function RecentPaymentsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading recent payments..."
      className="flex flex-col gap-3 pt-2"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl bg-canvas/60 p-3.5"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-9 rounded-full" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-28 rounded-md" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Skeleton className="h-4 w-16 rounded-md" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaymentRowsSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading payments..."
      className="flex flex-col gap-3 divide-y divide-border/60"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between pt-3">
          <div className="flex items-center gap-3">
            <Skeleton className="size-10 rounded-full" />
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-3.5 w-24 rounded" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end gap-1">
              <Skeleton className="h-4 w-20 rounded-md" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-6 w-20 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function PaymentsViewSkeleton() {
  return (
    <main
      role="status"
      aria-label="Loading payments..."
      className="flex flex-col gap-6 p-4 sm:p-6 md:p-10"
    >
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-col gap-1.5">
          <Skeleton className="h-10 w-44 rounded-xl" />
          <Skeleton className="h-4 w-64 rounded-md" />
        </div>
        <Skeleton className="h-12 w-40 rounded-2xl" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-3xl bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-3.5 w-24 rounded" />
            <Skeleton className="h-7 w-32 rounded-lg" />
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-6 w-32 rounded-lg" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-16 rounded-xl" />
            <Skeleton className="h-8 w-16 rounded-xl" />
          </div>
        </div>
        <PaymentRowsSkeleton count={5} />
      </div>
    </main>
  );
}

export function MakePaymentSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading payment form..."
      className="mx-auto flex w-full max-w-2xl flex-col gap-6 p-4 sm:p-6"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-9 w-48 rounded-xl" />
        <Skeleton className="h-4 w-72 rounded-md" />
      </div>
      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 shadow-sm">
        <Skeleton className="h-5 w-32 rounded-md" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Skeleton className="h-20 rounded-2xl" />
          <Skeleton className="h-20 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-2 pt-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="mt-2 h-12 w-full rounded-xl" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                          Service Requests Skeletons                        */
/* -------------------------------------------------------------------------- */

export function ServiceRequestsListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading service requests..."
      className="flex flex-col gap-4"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-3 rounded-3xl border border-border bg-white p-6 shadow-sm"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex flex-col gap-1.5">
              <Skeleton className="h-6 w-44 rounded-lg" />
              <Skeleton className="h-4 w-32 rounded-md" />
            </div>
            <Skeleton className="h-6 w-24 rounded-full" />
          </div>
          <Skeleton className="h-4 w-3/4 rounded-md" />
          <div className="flex items-center justify-between border-t border-border/60 pt-3">
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-8 w-24 rounded-xl" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function RequestServiceSkeleton() {
  return (
    <main
      role="status"
      aria-label="Loading service request form..."
      className="mx-auto flex w-full max-w-3xl flex-col gap-6 p-4 sm:p-6 md:p-10"
    >
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-56 rounded-xl" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>
      <div className="flex flex-col gap-5 rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-28 rounded-md" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-36 rounded-md" />
          <div className="grid gap-3 sm:grid-cols-2">
            <Skeleton className="h-24 rounded-2xl" />
            <Skeleton className="h-24 rounded-2xl" />
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <Skeleton className="h-4 w-40 rounded-md" />
          <Skeleton className="h-32 w-full rounded-2xl" />
        </div>
        <Skeleton className="h-12 w-full rounded-xl" />
      </div>
    </main>
  );
}

export function ServiceDocumentsSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading documents..."
      className="flex flex-col gap-4"
    >
      {Array.from({ length: 3 }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between rounded-2xl border border-border bg-white p-4"
        >
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <div className="flex flex-col gap-1">
              <Skeleton className="h-4 w-36 rounded-md" />
              <Skeleton className="h-3 w-20 rounded" />
            </div>
          </div>
          <Skeleton className="h-8 w-24 rounded-xl" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                         Notifications & Profile Skeletons                  */
/* -------------------------------------------------------------------------- */

export function NotificationsListSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading notifications..."
      className="flex flex-col gap-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-start gap-4 rounded-3xl border border-border bg-white p-5 shadow-sm"
        >
          <Skeleton className="size-10 rounded-full shrink-0" />
          <div className="flex flex-1 flex-col gap-2">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-40 rounded-md" />
              <Skeleton className="h-3 w-16 rounded" />
            </div>
            <Skeleton className="h-3.5 w-full rounded" />
            <Skeleton className="h-3.5 w-2/3 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <main
      role="status"
      aria-label="Loading profile..."
      className="mx-auto flex w-full max-w-4xl flex-col gap-6 p-4 sm:p-6 md:p-10"
    >
      <div className="flex flex-col gap-1.5">
        <Skeleton className="h-10 w-48 rounded-xl" />
        <Skeleton className="h-4 w-64 rounded-md" />
      </div>

      <div className="flex flex-col gap-6 rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-4">
          <Skeleton className="size-16 rounded-full" />
          <div className="flex flex-col gap-2">
            <Skeleton className="h-6 w-40 rounded-lg" />
            <Skeleton className="h-4 w-28 rounded-md" />
          </div>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 pt-2">
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
          <div className="flex flex-col gap-1.5">
            <Skeleton className="h-4 w-20 rounded" />
            <Skeleton className="h-12 w-full rounded-xl" />
          </div>
        </div>
        <Skeleton className="h-11 w-32 rounded-xl" />
      </div>

      <div className="flex flex-col gap-4 rounded-3xl bg-white p-6 sm:p-8 shadow-sm">
        <Skeleton className="h-6 w-36 rounded-lg" />
        <div className="flex flex-col gap-3">
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-12 w-full rounded-xl" />
        </div>
        <Skeleton className="h-11 w-40 rounded-xl" />
      </div>
    </main>
  );
}

export function PackageChoiceSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div
      role="status"
      aria-label="Loading packages..."
      className="grid gap-3 sm:grid-cols-3"
    >
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex flex-col gap-2 rounded-2xl border border-border bg-white p-4"
        >
          <Skeleton className="h-5 w-24 rounded-md" />
          <Skeleton className="h-6 w-20 rounded-md" />
          <Skeleton className="h-3.5 w-full rounded" />
        </div>
      ))}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*                       Full View & App Layout Skeletons                     */
/* -------------------------------------------------------------------------- */

export function DashboardSkeleton() {
  return (
    <div
      role="status"
      aria-label="Loading dashboard..."
      className="flex flex-col gap-8"
    >
      {/* Welcome header */}
      <div className="flex flex-col gap-2">
        <Skeleton className="h-10 w-64 rounded-xl sm:h-12" />
        <Skeleton className="h-4 w-80 rounded-md" />
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col gap-2 rounded-3xl bg-white p-5 shadow-sm"
          >
            <Skeleton className="h-3.5 w-28 rounded" />
            <Skeleton className="h-8 w-36 rounded-lg" />
          </div>
        ))}
      </div>

      {/* Plans Section */}
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-36 rounded-lg" />
          <Skeleton className="h-4 w-24 rounded-md" />
        </div>
        <PlansCardsSkeleton count={2} />
      </div>

      {/* Recent Payments Section */}
      <div className="flex flex-col gap-3 rounded-3xl bg-white p-6 shadow-sm">
        <div className="flex items-center justify-between">
          <Skeleton className="h-7 w-40 rounded-lg" />
          <Skeleton className="h-4 w-16 rounded-md" />
        </div>
        <RecentPaymentsSkeleton />
      </div>
    </div>
  );
}

export function AppLayoutSkeleton() {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Desktop Sidebar placeholder */}
      <aside
        role="status"
        aria-label="Loading navigation..."
        className="sticky top-0 hidden h-screen w-[248px] shrink-0 flex-col gap-6 bg-foreground p-5 text-canvas md:flex"
      >
        <div className="flex items-center gap-3">
          <Skeleton className="size-8 rounded-lg bg-canvas/15" />
          <Skeleton className="h-5 w-28 rounded-md bg-canvas/15" />
        </div>
        <div className="flex flex-1 flex-col gap-2 pt-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="flex items-center gap-3 rounded-xl px-3 py-2.5"
            >
              <Skeleton className="size-5 rounded-md bg-canvas/10 shrink-0" />
              <Skeleton className="h-4 w-28 rounded-md bg-canvas/10" />
            </div>
          ))}
        </div>
        <div className="flex items-center gap-3 border-t border-canvas/10 pt-4">
          <Skeleton className="size-8 rounded-full bg-canvas/15 shrink-0" />
          <div className="flex flex-1 flex-col gap-1.5">
            <Skeleton className="h-3.5 w-20 rounded bg-canvas/15" />
            <Skeleton className="h-2.5 w-28 rounded bg-canvas/10" />
          </div>
        </div>
      </aside>

      {/* Main content placeholder */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile Header placeholder */}
        <header className="flex h-16 items-center justify-between border-b border-border bg-white px-4 md:hidden">
          <div className="flex items-center gap-3">
            <Skeleton className="size-8 rounded-lg" />
            <Skeleton className="h-5 w-24 rounded-md" />
          </div>
          <Skeleton className="size-9 rounded-xl" />
        </header>

        <main className="flex-1 p-4 sm:p-6 md:p-10">
          <DashboardSkeleton />
        </main>
      </div>
    </div>
  );
}
