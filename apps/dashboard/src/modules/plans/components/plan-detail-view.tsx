import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { formatPhoneDisplay } from "@journeyhome/ui/lib/phone";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link, useParams } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import {
  AsyncBoundary,
  PlanDetailSkeleton,
  RecentPaymentsSkeleton,
} from "@/components/async-boundary";
import { NoticeBanner } from "@/components/notice-banner";
import { PAYMENT_TEXT, StatusPill } from "@/components/status-pill";
import { ApiError } from "@/lib/api";
import {
  capitalise,
  formatDay,
  formatMoney,
  formatMonthYear,
} from "@/lib/format";
import { usePayments } from "@/modules/payments/query-options";
import {
  canPayNow,
  contributionCount,
  MARKETING_URL,
  nextCell,
  planNotice,
  startedLabel,
} from "@/modules/plans/plans.utils";
import { usePlan } from "@/modules/plans/query-options";
import { useServiceRequests } from "@/modules/service-requests/query-options";
import {
  activeRequestFor,
  serviceNotice,
} from "@/modules/service-requests/service-requests.utils";

function Detail({
  label,
  value,
  wide,
}: {
  label: string;
  value?: string;
  wide?: boolean;
}) {
  return (
    <div className={wide ? "sm:col-span-3" : undefined}>
      <div className="text-xs font-semibold uppercase tracking-[2px] text-muted-foreground">
        {label}
      </div>
      <div className="mt-1 text-[15px] font-medium">{value || "—"}</div>
    </div>
  );
}

export function PlanDetailView() {
  const { id } = useParams({ from: "/app/plans/$id" });
  const planQ = usePlan(id);
  const paymentsQ = usePayments();
  const requestsQ = useServiceRequests();
  const plan = planQ.data;

  if (planQ.isPending) return <PlanDetailSkeleton />;
  if (planQ.isError || !plan) {
    const missing =
      planQ.error instanceof ApiError &&
      (planQ.error.status === 404 || planQ.error.status === 400);
    return (
      <main className="flex flex-1 flex-col items-start gap-3 max-w-4xl">
        <h1 className="font-serif text-4xl">
          {missing ? "We couldn’t find that plan" : "Something went wrong"}
        </h1>
        <p className="text-muted-foreground">
          {missing
            ? "It may have been removed, or it belongs to a different account."
            : planQ.error?.message}
        </p>
        <div className="flex gap-4 text-sm font-bold">
          {!missing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => void planQ.refetch()}
            >
              Try again
            </Button>
          )}
          <Link
            to="/app/plans"
            className={cn(buttonVariants({ variant: "link", size: "sm" }))}
          >
            Back to my plans
          </Link>
        </div>
      </main>
    );
  }

  const [first, ...rest] = plan.coveredPerson.fullName.split(" ");
  const money = (n: number) => formatMoney(n, plan.currency);
  const next = nextCell(plan);
  const notice =
    serviceNotice(plan, activeRequestFor(plan._id, requestsQ.data)) ??
    planNotice(plan);
  const person = plan.coveredPerson;
  const history = (paymentsQ.data ?? []).filter(
    (p) => p.plan === plan._id && p.status !== "Pending",
  );
  const canPay = canPayNow(plan);

  return (
    <main className="flex flex-1 flex-col gap-6 max-w-4xl">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="text-sm text-muted-foreground">
            <Link to="/app" className="hover:underline">
              Dashboard
            </Link>{" "}
            /{" "}
            <Link to="/app/plans" className="hover:underline">
              My plans
            </Link>{" "}
            / {person.fullName}
          </div>
          <div className="flex items-center gap-3">
            <h1 className="font-serif text-[52px] font-normal leading-[1.05]">
              {first}{" "}
              {rest.length > 0 && (
                <span className="italic">{rest.join(" ")}</span>
              )}
            </h1>
            <StatusPill status={plan.status} />
          </div>
        </div>
        {canPay && (
          <Link
            to="/app/payments/new"
            search={{ plan: plan._id }}
            className={cn(
              buttonVariants({ variant: "accent", size: "lg" }),
              "rounded-2xl px-6",
            )}
          >
            Complete payment
          </Link>
        )}
      </header>

      {notice && <NoticeBanner notice={notice} />}

      <section
        aria-label="Plan summary"
        className="flex flex-col gap-5 rounded-[28px] bg-foreground p-8 text-canvas"
      >
        <div className="grid gap-6 sm:grid-cols-4">
          {[
            ["Total saved", money(plan.totalContributedAmount)],
            ["Monthly contribution", money(plan.amount)],
            ["Package", plan.packageDetails.name],
            [next.label, next.value],
          ].map(([label, value]) => (
            <div key={label}>
              <div className="text-xs font-semibold uppercase tracking-[2px] text-canvas/70">
                {label}
              </div>
              <div className="mt-1 text-[28px] font-bold leading-tight tracking-tight">
                {value}
              </div>
            </div>
          ))}
        </div>
        <div className="text-xs text-canvas/70">
          {contributionCount(plan)} contribution
          {contributionCount(plan) === 1 ? "" : "s"} made since{" "}
          {startedLabel(plan)} · savings continue for as long as the plan is
          active, with no fixed end date
        </div>
      </section>

      <section
        aria-label="Covered person"
        className="flex flex-col gap-6 rounded-[28px] bg-white p-8"
      >
        <h2 className="font-serif text-[28px] font-normal">
          Who this plan is for
        </h2>
        <div className="grid gap-6 sm:grid-cols-3">
          <Detail label="Full name" value={person.fullName} />
          <Detail
            label="Relationship"
            value={capitalise(person.relationship)}
          />
          <Detail
            label="Date of birth"
            value={
              person.dateOfBirth
                ? `${formatDay(person.dateOfBirth)} ${new Date(person.dateOfBirth).getUTCFullYear()}`
                : undefined
            }
          />
          <Detail label="Gender" value={capitalise(person.gender ?? "")} />
          <Detail
            label="Phone number"
            value={
              person.phoneNumber
                ? formatPhoneDisplay(person.phoneNumber)
                : undefined
            }
          />
          <Detail label="Started" value={formatMonthYear(plan.startDate)} />
          <Detail label="Home address" value={person.address} wide />
        </div>
      </section>

      <section
        aria-label="Plan payment history"
        className="flex flex-col gap-1 rounded-[28px] bg-white p-8"
      >
        <div className="mb-2 flex items-end justify-between">
          <h2 className="font-serif text-[28px] font-normal">
            Payment history
          </h2>
          <Link
            to="/app/payments"
            search={{ plan: plan._id }}
            className={cn(
              buttonVariants({ variant: "link", size: "sm" }),
              "font-semibold text-link hover:text-link-hover p-0 h-auto",
            )}
          >
            See all payments
          </Link>
        </div>
        <AsyncBoundary
          isLoading={paymentsQ.isPending}
          isError={paymentsQ.isError}
          error={paymentsQ.error}
          onReset={() => void paymentsQ.refetch()}
          loadingFallback={<RecentPaymentsSkeleton />}
        >
          {paymentsQ.isSuccess && history.length === 0 && (
            <p className="py-4 text-sm text-muted-foreground">
              No payments on this plan yet.
            </p>
          )}
        </AsyncBoundary>
        {history.slice(0, 3).map((pay) => (
          <div
            key={pay._id}
            className="flex items-center justify-between border-t border-border py-4"
          >
            <div className="text-sm text-muted-foreground">
              {formatDay(pay.processedAt ?? pay.createdAt)}{" "}
              {new Date(pay.processedAt ?? pay.createdAt).getFullYear()} ·{" "}
              {pay.purpose === "initial_contribution"
                ? "First contribution"
                : "Monthly contribution"}
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
        ))}
        {history.length > 3 && (
          <div className="border-t border-border pt-4 text-center text-sm">
            <Link
              to="/app/payments"
              search={{ plan: plan._id }}
              className={cn(
                buttonVariants({ variant: "link", size: "sm" }),
                "font-semibold text-link",
              )}
            >
              View full history
            </Link>
          </div>
        )}
      </section>

      <div className="flex items-start gap-3 rounded-2xl bg-cream px-5 py-4 text-[13px] leading-relaxed text-status-due">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div>
          The {plan.packageDetails.name} package is fixed for the life of this
          plan and can&rsquo;t be changed once started.{" "}
          <a href={`${MARKETING_URL}/terms`} className="underline">
            Read the policy
          </a>
        </div>
      </div>
    </main>
  );
}
export default PlanDetailView;
