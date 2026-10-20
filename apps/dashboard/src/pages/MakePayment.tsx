import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { ShieldCheck } from "lucide-react";
import { Button } from "@journeyhome/ui/components/button";
import { StatusPill } from "../components/StatusPill";
import { useStartCheckout } from "../lib/checkout";
import { formatDay, formatMoney } from "../lib/format";
import { MARKETING_URL, canPayNow, fullName, relationshipLabel } from "../lib/plans";
import { usePlans } from "../lib/queries";
import type { Plan } from "../lib/types";

function Shell({ crumb, children }: { crumb?: string; children: React.ReactNode }) {
  return (
    <main className="flex max-w-[540px] flex-col gap-6 p-10">
      <header>
        <div className="text-sm text-muted">
          <Link to="/app/plans" className="hover:underline">My plans</Link> / {crumb ?? "Make a payment"}
        </div>
        <h1 className="font-serif text-[52px] font-normal leading-[1.05]">
          Make a <span className="italic">payment</span>
        </h1>
      </header>
      {children}
    </main>
  );
}

const Note = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl bg-white p-6 text-sm leading-relaxed text-ink-soft">{children}</div>
);

function Checkout({ plan }: { plan: Plan }) {
  const navigate = useNavigate();
  const money = formatMoney(plan.contributionAmountMinor, plan.currency);
  const start = useStartCheckout(plan._id);
  const busy = start.isPending || start.isSuccess;

  return (
    <>
      <section className="flex flex-col gap-3.5 rounded-[28px] bg-foreground p-7 text-canvas">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="font-serif text-2xl">{fullName(plan)}&rsquo;s plan</div>
            <div className="text-[13px] text-canvas/70">{relationshipLabel(plan)} · {plan.packageSnapshot.name} package</div>
          </div>
          <StatusPill status={plan.status} />
        </div>
        <hr className="border-canvas/15" />
        <div className="flex justify-between text-sm text-canvas/80"><span>First monthly contribution</span><span>{money}</span></div>
        <hr className="border-canvas/15" />
        <div className="flex items-baseline justify-between">
          <span className="text-lg font-bold">Total due</span>
          <span className="text-xl font-bold text-accent">{money}</span>
        </div>
      </section>

      <section className="flex flex-col gap-3 rounded-[28px] bg-white p-7">
        <h2 className="font-serif text-[26px] font-normal">Payment method</h2>
        <div className="flex items-start gap-3 rounded-2xl border border-foreground bg-cream/50 p-4 text-sm">
          <ShieldCheck className="mt-0.5 size-5 shrink-0 text-status-active" />
          <div>
            <div className="font-bold">Secure checkout with Paystack</div>
            <div className="text-muted">You&rsquo;ll choose a card or bank option on the next screen. Your card details never touch our servers.</div>
          </div>
        </div>
        <p className="text-xs text-muted">
          Your plan starts as soon as this payment is confirmed. After that, monthly contributions are collected automatically.
        </p>
      </section>

      {start.isError && (
        <p role="alert" className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">{start.error.message}</p>
      )}
      <div className="flex gap-3">
        <Button variant="outline" size="lg" className="h-[54px] rounded-xl" onClick={() => navigate("/app/plans")} disabled={busy}>Cancel</Button>
        <Button variant="accent" size="lg" className="h-[54px] flex-1 rounded-xl" disabled={busy} onClick={() => start.mutate()}>
          {busy ? "Taking you to Paystack…" : `Confirm payment — ${money}`}
        </Button>
      </div>
      <p className="text-center text-xs text-muted">
        A missed payment is never forfeited — it&rsquo;s recorded as a deficit.{" "}
        <a href={`${MARKETING_URL}/terms`} className="text-link underline">Read the policy</a>
      </p>
    </>
  );
}

export default function MakePayment() {
  const plansQ = usePlans();
  const [params] = useSearchParams();
  const planId = params.get("plan");

  if (plansQ.isPending) return <Shell><p className="text-muted">Loading…</p></Shell>;
  if (plansQ.isError) return <Shell><p role="alert" className="text-status-cancelled">{plansQ.error.message}</p></Shell>;

  const plans = plansQ.data;
  const plan = planId ? plans.find((p) => p._id === planId) : undefined;

  if (plan && canPayNow(plan)) return <Shell><Checkout plan={plan} /></Shell>;

  if (plan) {
    return (
      <Shell>
        <Note>
          <div className="mb-1 font-serif text-2xl text-foreground">Nothing to pay manually</div>
          {plan.status === "Active" || plan.status === "Payment_Due" || plan.status === "Overdue" ? (
            <>
              {fullName(plan)}&rsquo;s plan is already running. Monthly contributions are collected automatically using the card from your first
              payment{plan.nextPaymentDate ? <>, next on <strong>{formatDay(plan.nextPaymentDate)}</strong></> : null}. If a charge fails, we&rsquo;ll let
              you know.
            </>
          ) : (
            <>This plan can&rsquo;t take a payment right now.</>
          )}
        </Note>
        <Link to={`/app/plans/${plan._id}`} className="text-sm font-bold text-link underline">Back to plan</Link>
      </Shell>
    );
  }

  // No (valid) plan chosen: list the plans that are waiting on a first payment.
  const waiting = plans.filter(canPayNow);
  return (
    <Shell>
      {waiting.length === 0 ? (
        <Note>
          <div className="mb-1 font-serif text-2xl text-foreground">You&rsquo;re all set</div>
          None of your plans is waiting on a payment. Monthly contributions are collected automatically after your first payment.
        </Note>
      ) : (
        <div className="flex flex-col gap-3">
          <p className="text-sm text-muted">Choose the plan you&rsquo;d like to start:</p>
          {waiting.map((p) => (
            <Link
              key={p._id}
              to={`/app/payments/new?plan=${p._id}`}
              className="flex items-center justify-between rounded-2xl border border-border bg-white p-5 hover:border-foreground"
            >
              <div>
                <div className="font-serif text-xl">{fullName(p)}</div>
                <div className="text-xs text-muted">{relationshipLabel(p)} · {p.packageSnapshot.name}</div>
              </div>
              <div className="text-sm font-bold">{formatMoney(p.contributionAmountMinor, p.currency)}</div>
            </Link>
          ))}
        </div>
      )}
      <Link to="/app/plans" className="text-sm font-bold text-link underline">Back to my plans</Link>
    </Shell>
  );
}
