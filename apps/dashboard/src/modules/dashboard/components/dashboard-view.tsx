import type { Payment, Plan } from "@journeyhome/schemas";
import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { AlertCircle, Bell, Plus } from "lucide-react";
import { env } from "#/env/client";
import {
  AsyncBoundary,
  PlansCardsSkeleton,
  RecentPaymentsSkeleton,
} from "@/components/async-boundary";
import { PAYMENT_TEXT, StatusPill } from "@/components/status-pill";
import {
  capitalise,
  daysUntil,
  firstName,
  formatDay,
  formatMoney,
  formatMonthYear,
  formatToday,
  greeting,
  initials,
} from "@/lib/format";
import { useSessionUser } from "@/modules/auth/query-options";
import { usePayments } from "@/modules/payments/query-options";
import { canPayNow, isDue, LIVE } from "@/modules/plans/plans.utils";
import {
  usePlans,
  usePlansDashboardSummary,
} from "@/modules/plans/query-options";

const MARKETING_URL = env.VITE_MARKETING_URL;
const HIDDEN = new Set<Plan["status"]>(["Cancelled", "Expired"]);

function dueLabel(p: Plan) {
  if (!p.nextPaymentDate) return "—";
  const d = daysUntil(p.nextPaymentDate);
  if (p.status === "Overdue" || d < 0) return "Overdue";
  return d === 0 ? "Due today" : `Next ${formatDay(p.nextPaymentDate)}`;
}

function SummaryCard({
  label,
  children,
  sub,
  subClass,
}: {
  label: string;
  children: React.ReactNode;
  sub: string;
  subClass?: string;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-[20px] bg-white p-6 shadow-sm">
      <div className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">
        {label}
      </div>
      <div className="text-[32px] font-bold leading-tight tracking-tight">
        {children}
      </div>
      <div className={cn("text-[13px] text-muted-foreground", subClass)}>
        {sub}
      </div>
    </div>
  );
}

function PlanCard({ plan }: { plan: Plan }) {
  const dark = plan.status === "Active";
  const pay = canPayNow(plan);
  const count =
    plan.amount > 0 ? Math.round(plan.totalContributedAmount / plan.amount) : 0;
  const name =
    capitalise(plan.coveredPerson.relationship) ||
    firstName(plan.coveredPerson.fullName);
  return (
    <article
      className={cn(
        "flex flex-col gap-4 rounded-3xl p-5",
        dark ? "bg-foreground text-canvas" : "border border-border bg-white",
      )}
    >
      <div>
        <h3 className="font-serif text-2xl font-normal">Journey Home Plan</h3>
        <div
          className={cn(
            "text-[13px]",
            dark ? "text-canvas/70" : "text-muted-foreground",
          )}
        >
          {name} · {firstName(plan.coveredPerson.fullName)}
        </div>
      </div>
      <div className="flex items-center justify-between">
        <StatusPill
          status={plan.status}
          className={dark ? "bg-status-active/40 text-[#9FE0BC]" : undefined}
        />
        <span
          className={cn(
            "text-xs",
            dark ? "text-canvas/70" : "text-muted-foreground",
          )}
        >
          {plan.packageDetails.name}
        </span>
      </div>
      <div className="text-[28px] font-bold tracking-tight">
        {formatMoney(plan.totalContributedAmount, plan.currency)}
      </div>
      <div
        className={cn(
          "flex justify-between text-xs",
          dark ? "text-canvas/70" : "text-muted-foreground",
        )}
      >
        <span>
          {count} × {formatMoney(plan.amount, plan.currency)}
        </span>
        <span>{dueLabel(plan)}</span>
      </div>
      {pay ? (
        <Link
          to="/app/payments/new"
          search={{ plan: plan._id }}
          className={cn(buttonVariants({ variant: "accent" }), "w-full")}
        >
          Complete payment
        </Link>
      ) : (
        <Link
          to="/app/plans/$id"
          params={{ id: plan._id }}
          className={cn(
            buttonVariants({ variant: dark ? "outline" : "default" }),
            "w-full",
            dark && "border-canvas/30 text-canvas hover:bg-canvas/10",
          )}
        >
          View plan
        </Link>
      )}
    </article>
  );
}

function RecentPayments({
  payments,
  plans,
}: {
  payments: Payment[];
  plans: Plan[];
}) {
  const byId = new Map(plans.map((p) => [p._id, p]));
  const rows = payments.filter((p) => p.status !== "Pending").slice(0, 4);
  return (
    <>
      {rows.length === 0 && (
        <p className="py-6 text-sm text-muted-foreground">
          No payments yet. They&rsquo;ll appear here as soon as you make one.
        </p>
      )}
      {rows.map((pay) => {
        const plan = byId.get(pay.plan);
        return (
          <div
            key={pay._id}
            className="flex items-center justify-between border-b border-border py-3.5 last:border-0"
          >
            <div>
              <div className="text-sm font-semibold">
                Journey Home Plan
                {plan && (
                  <span className="font-normal text-muted-foreground">
                    {" "}
                    · {firstName(plan.coveredPerson.fullName)}
                  </span>
                )}
              </div>
              <div className="text-xs text-muted-foreground">
                {formatDay(pay.processedAt ?? pay.createdAt)} ·{" "}
                {pay.purpose === "initial_contribution"
                  ? "First contribution"
                  : "Monthly contribution"}
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold">
                {formatMoney(pay.amount, pay.currency)}
              </div>
              <div
                className={cn(
                  "text-xs font-semibold",
                  PAYMENT_TEXT[pay.status],
                )}
              >
                {pay.status}
              </div>
            </div>
          </div>
        );
      })}
    </>
  );
}

export function DashboardView() {
  const user = useSessionUser();
  const plansQ = usePlans();
  const paymentsQ = usePayments();
  const summaryQ = usePlansDashboardSummary();
  const now = new Date();

  const plans = (plansQ.data ?? []).filter((p) => !HIDDEN.has(p.status));
  const payments = paymentsQ.data ?? [];
  const live = plans.filter((p) => LIVE.has(p.status));
  const nextPlan = [...live]
    .filter((p) => Boolean(p.nextPaymentDate))
    .sort(
      (a, b) =>
        +new Date(a.nextPaymentDate as string) -
        +new Date(b.nextPaymentDate as string),
    )[0];
  const currency = plans[0]?.currency ?? "NGN";
  const successful = payments.filter((p) => p.status === "Successful");
  const firstSuccess = successful
    .map((p) => p.processedAt ?? p.createdAt)
    .sort()[0];
  const dueNow = live.find(isDue);
  const summary = summaryQ.data;

  return (
    <main className="flex flex-col gap-8 p-5 md:p-10">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            {formatToday(now)}
          </div>
          <h1 className="font-serif text-[36px] font-normal leading-[1.05] sm:text-[44px] md:text-[56px]">
            {greeting(now)},{" "}
            <span className="italic">{user ? firstName(user.name) : ""}</span>
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <Link
            to="/app/plans"
            search={{ new: "1" }}
            className={cn(buttonVariants({ variant: "default", size: "lg" }))}
          >
            <Plus className="size-4" />{" "}
            <span className="whitespace-nowrap">Create new plan</span>
          </Link>
          <Link
            to="/app/notifications"
            aria-label="Notifications"
            className={cn(
              buttonVariants({ variant: "outline", size: "icon-lg" }),
            )}
          >
            <Bell className="size-[18px]" />
          </Link>
          <Link
            to="/app/profile"
            aria-label={user?.name}
            className="grid size-[52px] shrink-0 place-items-center rounded-full bg-[#A9C4B0] text-sm font-bold text-foreground hover:opacity-90"
          >
            {user ? initials(user.name) : ""}
          </Link>
        </div>
      </header>

      {(plansQ.isError || paymentsQ.isError) && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-2xl bg-status-cancelled-bg px-5 py-4 text-sm text-status-cancelled"
        >
          <span>
            We couldn&rsquo;t load all your information.{" "}
            {(plansQ.error ?? paymentsQ.error)?.message}
          </span>
          <Button
            type="button"
            variant="link"
            size="sm"
            className="h-auto p-0 font-bold underline text-status-cancelled hover:text-status-cancelled"
            onClick={() => {
              void plansQ.refetch();
              void paymentsQ.refetch();
            }}
          >
            Try again
          </Button>
        </div>
      )}

      <section
        aria-label="Summary"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        <SummaryCard
          label="Total contributed"
          sub={
            summary?.paymentCount !== undefined
              ? `${summary.paymentCount} payment${summary.paymentCount === 1 ? "" : "s"} this month`
              : successful.length
                ? `${successful.length} payment${successful.length === 1 ? "" : "s"} since ${formatMonthYear(firstSuccess)}`
                : "No payments yet"
          }
        >
          {formatMoney(
            summary?.totalContributed ??
              plans.reduce((n, p) => n + p.totalContributedAmount, 0),
            currency,
          )}
        </SummaryCard>
        <SummaryCard
          label="Active plans"
          sub={
            live.map((p) => firstName(p.coveredPerson.fullName)).join(" · ") ||
            "No active plans yet"
          }
        >
          {summary?.activePlans ?? live.length}
        </SummaryCard>
        <SummaryCard
          label="Next payment"
          sub={
            nextPlan?.nextPaymentDate
              ? `${firstName(nextPlan.coveredPerson.fullName)}'s plan · ${isDue(nextPlan) ? (daysUntil(nextPlan.nextPaymentDate) < 0 ? "overdue" : "due today") : `due ${formatDay(nextPlan.nextPaymentDate)}`}`
              : "Nothing due"
          }
          subClass={
            nextPlan && isDue(nextPlan) ? "font-semibold text-link" : undefined
          }
        >
          {nextPlan ? formatMoney(nextPlan.amount, nextPlan.currency) : "—"}
        </SummaryCard>
      </section>

      <div className="grid items-start gap-6 xl:grid-cols-[1.15fr_1fr]">
        <section aria-label="Your plans" className="flex flex-col gap-4">
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[32px] font-normal">Your plans</h2>
            <Link
              to="/app/plans"
              className="text-sm font-semibold text-link hover:text-link-hover"
            >
              Manage plans
            </Link>
          </div>
          <AsyncBoundary
            isLoading={plansQ.isPending}
            isError={plansQ.isError}
            error={plansQ.error}
            onReset={() => void plansQ.refetch()}
            loadingFallback={<PlansCardsSkeleton count={2} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {plans.map((p) => (
                <PlanCard key={p._id} plan={p} />
              ))}
              <Link
                to="/app/plans"
                search={{ new: "1" }}
                className="flex min-h-[270px] flex-col items-center justify-center gap-3 rounded-3xl border border-dashed border-foreground/30 p-6 text-center transition-colors hover:border-foreground/60"
              >
                <span className="grid size-[52px] place-items-center rounded-full bg-sand">
                  <Plus className="size-5" />
                </span>
                <span className="font-serif text-xl">
                  {plans.length
                    ? "Plan for someone else"
                    : "Start your first plan"}
                </span>
                <span className="max-w-[220px] text-[13px] leading-relaxed text-muted-foreground">
                  Parents, grandparents, uncles, aunts — one plan per person,
                  all in one account.
                </span>
              </Link>
            </div>
          </AsyncBoundary>
        </section>

        <section
          aria-label="Recent payments"
          className="flex flex-col gap-2 rounded-3xl bg-white p-6"
        >
          <div className="flex items-end justify-between">
            <h2 className="font-serif text-[28px] font-normal">
              Recent payments
            </h2>
            <Link
              to="/app/payments"
              className="text-sm font-semibold text-link hover:text-link-hover"
            >
              See all
            </Link>
          </div>
          <AsyncBoundary
            isLoading={paymentsQ.isPending}
            isError={paymentsQ.isError}
            error={paymentsQ.error}
            onReset={() => void paymentsQ.refetch()}
            loadingFallback={<RecentPaymentsSkeleton />}
          >
            <RecentPayments payments={payments} plans={plansQ.data ?? []} />
          </AsyncBoundary>
          {dueNow && (
            <div className="mt-2 flex items-start gap-3 rounded-2xl bg-cream px-4 py-3.5 text-[13px] leading-relaxed text-status-due">
              <AlertCircle className="mt-0.5 size-4 shrink-0" />
              <div>
                {firstName(dueNow.coveredPerson.fullName)}&rsquo;s{" "}
                {formatMoney(dueNow.amount, dueNow.currency)} contribution is{" "}
                {(dueNow.nextPaymentDate &&
                  daysUntil(dueNow.nextPaymentDate) < 0) ||
                dueNow.status === "Overdue"
                  ? "overdue"
                  : "due today"}
                .
              </div>
            </div>
          )}
          <div className="mt-3 text-center text-xs">
            <a
              href={`${MARKETING_URL}/terms`}
              className="text-muted-foreground underline"
            >
              View plan terms &amp; conditions
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}

export default DashboardView;
