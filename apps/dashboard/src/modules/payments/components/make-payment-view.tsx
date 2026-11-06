import type { Plan } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ShieldCheck } from "lucide-react";
import { MakePaymentSkeleton } from "@/components/skeletons";
import { firstName, formatDay, formatMoney } from "@/lib/format";
import { useStartCheckout } from "@/modules/payments/checkout";
import {
  canPayNow,
  fullName,
  MARKETING_URL,
  relationshipLabel,
} from "@/modules/plans/plans.utils";
import { usePlans } from "@/modules/plans/query-options";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="flex flex-1 flex-col gap-6 max-w-2xl">
      <div>
        <div className="text-sm text-muted-foreground">
          <Link to="/app" className="hover:underline">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link to="/app/payments" className="hover:underline">
            Payments
          </Link>{" "}
          / Make payment
        </div>
        <h1 className="page-title">
          Make a <span className="italic">payment</span>
        </h1>
      </div>
      {children}
    </main>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-[24px] border border-border bg-white p-6 text-sm leading-relaxed text-muted-foreground">
      {children}
    </div>
  );
}

function Checkout({ plan }: { plan: Plan }) {
  const navigate = useNavigate();
  const start = useStartCheckout(plan._id);
  const busy = start.isPending || start.isSuccess;
  const money = formatMoney(plan.amount, plan.currency);
  const isFirst = plan.status === "Pending";

  return (
    <>
      <section className="flex items-center justify-between gap-4 rounded-[24px] bg-foreground p-6 text-canvas">
        <div>
          <div className="font-serif text-xl">
            {firstName(plan.coveredPerson.fullName)}&rsquo;s plan
          </div>
          <div className="text-[13px] text-canvas/70">
            {relationshipLabel(plan)} · {plan.packageDetails.name} package
          </div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{money}</div>
          <div className="text-xs text-canvas/70">
            {isFirst ? "first contribution" : "monthly contribution"}
          </div>
        </div>
      </section>

      <section className="flex items-start gap-3 rounded-[24px] bg-white p-6 text-sm shadow-sm">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-status-active" />
        <div className="leading-relaxed">
          <div className="font-bold">Secured by Paystack</div>
          <div className="text-muted-foreground">
            You&rsquo;ll complete your payment on Paystack&rsquo;s encrypted
            checkout using a debit card or bank transfer. Journey Home never
            stores your card details.
          </div>
        </div>
      </section>
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          size="lg"
          className="h-[54px] rounded-xl"
          onClick={() => navigate({ to: "/app/plans" })}
          disabled={busy}
        >
          Cancel
        </Button>
        <Button
          type="button"
          variant="accent"
          size="lg"
          className="h-[54px] flex-1 rounded-xl text-foreground font-bold"
          disabled={busy}
          onClick={() => start.mutate()}
        >
          {busy ? "Taking you to Paystack…" : `Confirm payment — ${money}`}
        </Button>
      </div>
      <p className="text-center text-xs text-muted-foreground">
        A missed payment is never forfeited — it&rsquo;s recorded as a deficit.{" "}
        <a href={`${MARKETING_URL}/terms`} className="text-link underline">
          Read the policy
        </a>
      </p>
    </>
  );
}

export function MakePaymentView() {
  const plansQ = usePlans();
  const { plan: planId } = useSearch({ from: "/app/payments/new" });

  if (plansQ.isPending) return <MakePaymentSkeleton />;
  if (plansQ.isError)
    return (
      <Shell>
        <p role="alert" className="text-status-cancelled">
          {plansQ.error.message}
        </p>
      </Shell>
    );

  const plans = plansQ.data;
  const plan = planId ? plans.find((p) => p._id === planId) : undefined;

  if (plan && canPayNow(plan))
    return (
      <Shell>
        <Checkout plan={plan} />
      </Shell>
    );

  if (plan) {
    return (
      <Shell>
        <Note>
          <div className="mb-1 font-serif text-2xl text-foreground">
            Nothing to pay manually
          </div>
          {plan.status === "Active" ||
          plan.status === "Payment_Due" ||
          plan.status === "Overdue" ? (
            <>
              {fullName(plan)}&rsquo;s plan is already running. Monthly
              contributions are collected automatically using the card from your
              first payment
              {plan.nextPaymentDate ? (
                <>
                  , next on <strong>{formatDay(plan.nextPaymentDate)}</strong>
                </>
              ) : null}
              . If a charge fails, we&rsquo;ll let you know.
            </>
          ) : (
            <>This plan can&rsquo;t take a payment right now.</>
          )}
        </Note>
        <Link
          to="/app/plans/$id"
          params={{ id: plan._id }}
          className="text-sm font-bold text-link underline"
        >
          Back to plan
        </Link>
      </Shell>
    );
  }

  // No (valid) plan chosen: list the plans that are waiting on a first payment.
  const waiting = plans.filter(canPayNow);
  return (
    <Shell>
      {waiting.length === 0 ? (
        <Note>
          <div className="mb-1 font-serif text-2xl text-foreground">
            You&rsquo;re all set
          </div>
          None of your plans is waiting on a payment. Monthly contributions are
          collected automatically after your first payment.
        </Note>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted-foreground">
            Choose the plan you&rsquo;d like to start:
          </p>
          {waiting.map((p) => (
            <Link
              key={p._id}
              to="/app/payments/new"
              search={{ plan: p._id }}
              className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 hover:border-foreground"
            >
              <div>
                <div className="font-serif text-xl">{fullName(p)}</div>
                <div className="text-xs text-muted-foreground">
                  {relationshipLabel(p)} · {p.packageDetails.name}
                </div>
              </div>
              <div className="text-sm font-bold">
                {formatMoney(p.amount, p.currency)}
              </div>
            </Link>
          ))}
        </div>
      )}
      <Link to="/app/plans" className="text-sm font-bold text-link underline">
        Back to my plans
      </Link>
    </Shell>
  );
}

export default MakePaymentView;
