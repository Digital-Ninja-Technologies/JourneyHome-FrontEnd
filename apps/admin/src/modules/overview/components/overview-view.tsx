import type { AdminOverview } from "@journeyhome/schemas";
import { buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import { DataTableFilter } from "@/components/data-table/data-table-toolbar";
import { KpiCard } from "@/components/kpi-card";
import { PageHeader } from "@/components/page-header";
import { SectionCard } from "@/components/section-card";
import { OverviewSkeleton } from "@/components/skeletons";
import { RequestStatusPill } from "@/components/status-pill";
import {
  matchPreset,
  monthRange,
  PERIOD_PRESETS,
  presetRange,
} from "@/lib/date";
import {
  firstName,
  formatCount,
  formatDay,
  formatMoney,
  formatMoneyCompact,
  formatToday,
  greeting,
} from "@/lib/format";
import { useAdminUser } from "@/modules/auth/query-options";
import { useOverview } from "../query-options";

export function OverviewView() {
  const search = useSearch({ from: "/_protected/" });
  const navigate = useNavigate({ from: "/" });
  const user = useAdminUser();
  // Without dates in the URL, ask for this month explicitly so the label is true.
  const overviewQ = useOverview(
    search.startDate && search.endDate ? search : monthRange(),
  );
  const preset = matchPreset(search.startDate, search.endDate) ?? "this_month";

  return (
    <AsyncBoundary
      isLoading={overviewQ.isPending}
      isError={overviewQ.isError && !overviewQ.data}
      error={overviewQ.error}
      onReset={() => void overviewQ.refetch()}
      loadingFallback={<OverviewSkeleton />}
    >
      <main className="flex flex-col gap-8">
        <PageHeader
          crumbs={[{ label: formatToday() }]}
          title={
            user
              ? `${greeting()}, ${firstName(user.name)}`
              : "Operations overview"
          }
          description="Users, plans, contributions, and requests at a glance."
          actions={
            <DataTableFilter
              label="Contributions"
              allLabel="This month"
              value={preset === "this_month" ? undefined : preset}
              options={PERIOD_PRESETS.filter((p) => p.value !== "this_month")}
              onChange={(p) => {
                const range = p ? presetRange(p) : undefined;
                navigate({
                  search: range
                    ? { startDate: range.from, endDate: range.to }
                    : {},
                  replace: true,
                });
              }}
            />
          }
        />
        {overviewQ.data && (
          <Overview
            data={overviewQ.data}
            periodLabel={
              PERIOD_PRESETS.find((p) => p.value === preset)?.label ??
              "This month"
            }
          />
        )}
      </main>
    </AsyncBoundary>
  );
}

function Breakdown({
  title,
  rows,
}: {
  title: string;
  rows: [label: string, value: string | number, highlight?: boolean][];
}) {
  return (
    <SectionCard
      title={title}
      className="gap-3"
      contentClassName="flex flex-col"
    >
      {rows.map(([label, value, highlight]) => (
        <div
          key={label}
          className="flex items-center justify-between border-t border-border py-3 text-sm"
        >
          <span className="text-muted-foreground">{label}</span>
          <span
            className={cn("font-bold tabular-nums", highlight && "text-link")}
          >
            {typeof value === "number" ? formatCount(value) : value}
          </span>
        </div>
      ))}
    </SectionCard>
  );
}

function Overview({
  data,
  periodLabel,
}: {
  data: AdminOverview;
  periodLabel: string;
}) {
  const { users, plans, contributions: c, serviceRequests: sr } = data;

  return (
    <>
      <section
        aria-label="Key figures"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <KpiCard
          label="Total users"
          value={formatCount(users.total)}
          sub={`+${users.newThisMonth} this month`}
        />
        <KpiCard
          label="Active plans"
          value={formatCount(plans.active)}
          sub={`${plans.overdue} overdue`}
        />
        <KpiCard
          label="Pending verification"
          value={formatCount(sr.pendingVerification)}
          tone="due"
          sub={
            <Link
              to="/service-requests"
              className="font-semibold text-link underline"
            >
              Review queue
            </Link>
          }
        />
        <KpiCard
          label={`Contributed · ${periodLabel.toLowerCase()}`}
          value={formatMoneyCompact(c.selectedPeriodContributed)}
          sub={`${formatMoneyCompact(c.totalContributed)} all time`}
        />
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
        <SectionCard
          title="Needs your review"
          action={
            <Link
              to="/service-requests"
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "h-auto p-0",
              )}
            >
              See all
            </Link>
          }
        >
          {data.needsReview.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              Nothing is waiting for review.
            </p>
          ) : (
            <ul className="flex flex-col">
              {data.needsReview.map((r) => (
                <li
                  key={r._id}
                  className="border-t border-border first:border-0"
                >
                  <Link
                    to="/service-requests/$id"
                    params={{ id: r._id }}
                    className="flex items-center justify-between gap-4 py-4 hover:opacity-80"
                  >
                    <div className="min-w-0">
                      <div className="font-bold">
                        {r.coveredPersonSnapshot.fullName}&rsquo;s service
                      </div>
                      <div className="truncate text-xs text-muted-foreground">
                        Submitted {formatDay(r.createdAt)} · {r.serviceLocation}
                      </div>
                    </div>
                    <RequestStatusPill status={r.status} />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <Breakdown
          title="Contributions"
          rows={[
            ["This month", formatMoney(c.monthlyContributed)],
            ["Monthly commitments", formatMoney(c.monthlyCommitments)],
            ["Average per active plan", formatMoney(c.averagePerActivePlan)],
            ["Total contributed", formatMoney(c.totalContributed)],
          ]}
        />
      </div>

      <section
        aria-label="Breakdown"
        className="grid gap-6 md:grid-cols-2 xl:grid-cols-3"
      >
        <Breakdown
          title="Users"
          rows={[
            ["Total", users.total],
            ["New this month", users.newThisMonth],
            ["Running plans", c.activePlanCount],
          ]}
        />
        <Breakdown
          title="Plans"
          rows={[
            ["Active", plans.active],
            ["Pending first payment", plans.pendingFirstPayment],
            ["Overdue", plans.overdue, plans.overdue > 0],
            ["Completed", plans.completed],
          ]}
        />
        <Breakdown
          title="Service requests"
          rows={[
            ["New", sr.new, sr.new > 0],
            ["In review", sr.inReview],
            ["Awaiting customer", sr.awaitingCustomer],
            ["Approved", sr.approved],
            ["Closed", sr.closed],
          ]}
        />
      </section>
    </>
  );
}
