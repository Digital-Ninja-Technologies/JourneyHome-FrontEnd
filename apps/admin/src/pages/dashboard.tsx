import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "react-router-dom";
import { useAuth } from "@/auth/auth-context";
import { Pill, QueryError } from "@/components/ui";
import {
  formatDay,
  formatMoney,
  formatMoneyCompact,
  formatToday,
  initials,
  isThisMonth,
} from "@/lib/format";
import { useAllPlans, useAllRequests, useDirectory } from "@/lib/queries";
import { LIVE_PLAN, NEEDS_REVIEW, REQUEST_STATUS } from "@/lib/status";

function Stat({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: React.ReactNode;
  tone?: "due";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-1.5 rounded-[20px] p-6",
        tone === "due" ? "bg-cream" : "bg-white shadow-sm",
      )}
    >
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[2px]",
          tone === "due" ? "text-status-due" : "text-muted",
        )}
      >
        {label}
      </div>
      <div className="text-[34px] font-bold leading-tight tracking-tight">
        {value}
      </div>
      <div className="text-[13px] text-muted">{sub}</div>
    </div>
  );
}

function Panel({
  title,
  rows,
}: {
  title: string;
  rows: [string, string | number, boolean?][];
}) {
  return (
    <section className="rounded-3xl bg-white p-6">
      <h2 className="mb-3 font-serif text-[22px] font-normal">{title}</h2>
      {rows.map(([label, value, hot]) => (
        <div
          key={label}
          className="flex items-center justify-between border-t border-border py-3 text-sm"
        >
          <span className="text-muted">{label}</span>
          <span className={cn("font-bold", hot && "text-link")}>{value}</span>
        </div>
      ))}
    </section>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const dir = useDirectory();
  const plansQ = useAllPlans();
  const reqQ = useAllRequests();
  const customers = dir.data ?? [];
  const plans = plansQ.data ?? [];
  const requests = reqQ.data ?? [];
  const error = dir.error ?? plansQ.error ?? reqQ.error;

  const live = plans.filter((p) => LIVE_PLAN.has(p.status));
  const count = (s: string) => plans.filter((p) => p.status === s).length;
  const queue = requests.filter((r) => NEEDS_REVIEW.has(r.status));
  const total = plans.reduce((n, p) => n + p.totalContributedMinor, 0);
  const owners = new Set(live.map((p) => p.owner));
  const rcount = (...s: string[]) =>
    requests.filter((r) => s.includes(r.status)).length;
  const loading = dir.isPending || plansQ.isPending || reqQ.isPending;

  return (
    <main className="flex flex-col gap-6 p-10">
      <header className="flex items-start justify-between">
        <div>
          <div className="text-sm text-muted">{formatToday()}</div>
          <h1 className="font-serif text-[44px] font-normal leading-[1.1]">
            Operations overview
          </h1>
        </div>
        <span className="grid size-11 place-items-center rounded-full bg-foreground text-sm font-bold text-canvas">
          {user ? initials(user.name) : ""}
        </span>
      </header>

      {error && (
        <QueryError
          error={error}
          retry={() => {
            void dir.refetch();
            void plansQ.refetch();
            void reqQ.refetch();
          }}
        />
      )}
      {loading && !error && <p className="text-muted">Loading…</p>}

      {!loading && (
        <>
          <section
            aria-label="Key figures"
            className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
          >
            <Stat
              label="Total users"
              value={customers.length.toLocaleString()}
              sub={`+${customers.filter((c) => isThisMonth(c.createdAt)).length} this month`}
            />
            <Stat
              label="Active plans"
              value={live.length.toLocaleString()}
              sub={`${count("Overdue")} overdue`}
            />
            <Stat
              label="Pending verification"
              value={String(queue.length)}
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
            <Stat
              label="Total contributed"
              value={formatMoneyCompact(total)}
              sub={`across ${plans.length.toLocaleString()} plans`}
            />
          </section>

          <section
            aria-label="Breakdown"
            className="grid gap-4 md:grid-cols-2 xl:grid-cols-4"
          >
            <Panel
              title="Users"
              rows={[
                ["Total", customers.length],
                [
                  "New this month",
                  customers.filter((c) => isThisMonth(c.createdAt)).length,
                ],
                ["With a running plan", owners.size],
              ]}
            />
            <Panel
              title="Plans"
              rows={[
                ["Running", live.length],
                ["Pending first payment", count("Pending")],
                ["Overdue", count("Overdue"), count("Overdue") > 0],
                ["Completed", count("Completed")],
              ]}
            />
            <Panel
              title="Service requests"
              rows={[
                ["New", rcount("Submitted")],
                ["In review", rcount("Under_Review", "Docs_Verified")],
                ["Awaiting customer", rcount("More_Info_Required")],
                ["Approved", rcount("Approved")],
              ]}
            />
            <Panel
              title="Contributions"
              rows={[
                ["Total contributed", formatMoney(total)],
                [
                  "Monthly commitments",
                  formatMoney(
                    live.reduce((n, p) => n + p.contributionAmountMinor, 0),
                  ),
                ],
                [
                  "Average per plan",
                  plans.length
                    ? formatMoney(Math.round(total / plans.length))
                    : "—",
                ],
              ]}
            />
          </section>

          <section className="rounded-3xl bg-white p-7">
            <div className="mb-2 flex items-end justify-between">
              <h2 className="font-serif text-[28px] font-normal">
                Needs your review
              </h2>
              <Link
                to="/service-requests"
                className="text-sm font-semibold text-link"
              >
                See all
              </Link>
            </div>
            {queue.length === 0 && (
              <p className="border-t border-border py-6 text-sm text-muted">
                Nothing is waiting for review.
              </p>
            )}
            {queue.slice(0, 5).map((r) => {
              const [label, tone] = REQUEST_STATUS[r.status];
              return (
                <Link
                  key={r._id}
                  to={`/service-requests/${r._id}`}
                  className="flex items-center justify-between gap-4 border-t border-border py-4"
                >
                  <div>
                    <div className="font-bold">
                      {r.coveredPersonSnapshot.fullName}&rsquo;s service
                    </div>
                    <div className="text-xs text-muted">
                      Submitted {formatDay(r.createdAt)} · {r.burialLocation}
                    </div>
                  </div>
                  <Pill label={label} tone={tone} />
                </Link>
              );
            })}
          </section>
        </>
      )}
    </main>
  );
}
