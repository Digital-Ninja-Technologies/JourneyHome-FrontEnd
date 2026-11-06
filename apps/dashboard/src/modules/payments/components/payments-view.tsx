import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { AlertCircle } from "lucide-react";
import {
  daysUntil,
  firstName,
  formatDay,
  formatMoney,
  formatMonthYear,
} from "@/lib/format";
import { usePayments } from "@/modules/payments/query-options";
import {
  canPayNow,
  isDue,
  LIVE,
  MARKETING_URL,
} from "@/modules/plans/plans.utils";
import { usePlans } from "@/modules/plans/query-options";
import { PaymentsTable } from "./payments-table";

function SummaryCard({
  label,
  value,
  sub,
  tone,
}: {
  label: string;
  value: string;
  sub: string;
  tone?: "due";
}) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 rounded-[20px] p-6",
        tone === "due" ? "bg-cream" : "bg-white shadow-sm",
      )}
    >
      <div
        className={cn(
          "text-xs font-semibold uppercase tracking-[2px]",
          tone === "due" ? "text-status-due" : "text-muted-foreground",
        )}
      >
        {label}
      </div>
      <div
        className={cn(
          "text-[32px] font-bold leading-tight tracking-tight",
          tone === "due" && "text-[#5C3B0C]",
        )}
      >
        {value}
      </div>
      <div
        className={cn(
          "text-[13px]",
          tone === "due" ? "text-status-due" : "text-muted-foreground",
        )}
      >
        {sub}
      </div>
    </div>
  );
}

export function PaymentsView() {
  const plansQ = usePlans();
  const paymentsQ = usePayments();
  const navigate = useNavigate({ from: "/app/payments/" });
  const { plan: filter } = useSearch({ from: "/app/payments/" });

  const plans = plansQ.data ?? [];
  const payments = paymentsQ.data ?? [];

  const successful = payments.filter((p) => p.status === "Successful");
  const firstSuccess = successful
    .map((p) => p.processedAt ?? p.createdAt)
    .sort()[0];
  const live = plans.filter((p) => LIVE.has(p.status));
  const next = [...live]
    .filter((p) => Boolean(p.nextPaymentDate))
    .sort(
      (a, b) =>
        +new Date(a.nextPaymentDate as string) -
        +new Date(b.nextPaymentDate as string),
    )[0];
  const nextDue = next && isDue(next);
  const currency = plans[0]?.currency ?? "NGN";

  const error = plansQ.error ?? paymentsQ.error;

  return (
    <main className="flex flex-1 flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="text-sm text-muted-foreground">
            <Link to="/app" className="hover:underline">
              Dashboard
            </Link>{" "}
            / Payments
          </div>
          <h1 className="page-title">Payments</h1>
        </div>
        {plans.some(canPayNow) && (
          <Link
            to="/app/payments/new"
            className={cn(
              buttonVariants({ variant: "default", size: "lg" }),
              "h-[52px] rounded-2xl px-6 text-sm font-semibold",
            )}
          >
            Make a payment
          </Link>
        )}
      </header>

      {error && (
        <div
          role="alert"
          className="flex items-center justify-between gap-4 rounded-2xl bg-status-cancelled-bg px-5 py-4 text-sm text-status-cancelled"
        >
          <span>We couldn&rsquo;t load your payments. {error.message}</span>
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

      <section aria-label="Summary" className="grid gap-4 md:grid-cols-3">
        <SummaryCard
          label="Total contributed"
          value={formatMoney(
            plans.reduce((n, p) => n + p.totalContributedAmount, 0),
            currency,
          )}
          sub={`across ${plans.length} plan${plans.length === 1 ? "" : "s"}`}
        />
        <SummaryCard
          label="Payments made"
          value={String(successful.length)}
          sub={
            successful.length
              ? `since ${formatMonthYear(firstSuccess)}`
              : "No payments yet"
          }
        />
        {next ? (
          <SummaryCard
            label={
              nextDue
                ? next.nextPaymentDate && daysUntil(next.nextPaymentDate) < 0
                  ? "Overdue"
                  : "Due today"
                : "Next payment"
            }
            value={formatMoney(next.amount, next.currency)}
            sub={`${firstName(next.coveredPerson.fullName)}'s plan${nextDue || !next.nextPaymentDate ? "" : ` · ${formatDay(next.nextPaymentDate)}`}`}
            tone={nextDue ? "due" : undefined}
          />
        ) : (
          <SummaryCard label="Next payment" value="—" sub="Nothing due" />
        )}
      </section>

      <section className="flex flex-col gap-6 rounded-3xl bg-white p-6 sm:p-8">
        <PaymentsTable
          payments={payments}
          plans={plans}
          isLoading={paymentsQ.isPending}
          selectedPlanId={filter}
          onSelectPlanId={(id) => {
            navigate({
              search: (prev) => ({ ...prev, plan: id }),
              replace: true,
            });
          }}
        />
      </section>

      <div className="flex items-start gap-3 rounded-2xl bg-cream px-5 py-4 text-[13px] leading-relaxed text-status-due">
        <AlertCircle className="mt-0.5 size-4 shrink-0" />
        <div>
          A missed payment is never forfeited. It&rsquo;s recorded as a deficit
          and cleared automatically at your next payment on that plan.{" "}
          <a href={`${MARKETING_URL}/terms`} className="underline">
            Read the full policy
          </a>
        </div>
      </div>
    </main>
  );
}

export default PaymentsView;
