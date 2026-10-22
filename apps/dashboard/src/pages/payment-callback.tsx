import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect } from "react";
import { api } from "../lib/api";
import { getOnboardingPlan } from "../lib/checkout";
import { formatMoney } from "../lib/format";
import type { Payment } from "../lib/types";

/** Paystack returns here after checkout with ?reference=…; we ask the backend to verify it. */
export default function PaymentCallback() {
  const search = useSearch({ from: "/app/payments/callback" });
  const reference = search.reference ?? search.trxref;
  const queryClient = useQueryClient();

  const verify = useQuery({
    queryKey: ["verify-payment", reference],
    queryFn: () =>
      api<Payment>(`/payments/verify/${reference}`, { method: "POST" }),
    enabled: !!reference,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (verify.isSuccess) {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      void queryClient.invalidateQueries({ queryKey: ["plan"] });
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
    }
  }, [verify.isSuccess, queryClient]);

  const pay = verify.data;

  // A new customer finishing onboarding continues to the welcome screen.
  if (
    pay?.status === "Successful" &&
    pay.purpose === "initial_contribution" &&
    getOnboardingPlan() === pay.plan
  ) {
    return <Navigate to="/welcome" search={{ plan: pay.plan }} replace />;
  }
  let icon = <Clock className="size-10 text-status-due" />;
  let title = "Confirming your payment…";
  let body = "Please don’t close this page.";
  let action = null as React.ReactNode;

  if (!reference) {
    icon = <XCircle className="size-10 text-status-cancelled" />;
    title = "We couldn’t find that payment";
    body =
      "This page needs a payment reference. If you were charged, check your payment history.";
    action = (
      <Link to="/app/payments" className="font-bold text-link underline">
        View payments
      </Link>
    );
  } else if (verify.isError) {
    icon = <XCircle className="size-10 text-status-cancelled" />;
    title = "We couldn’t confirm your payment";
    body = `${verify.error.message} If you were charged, don’t worry — it will be applied as soon as it’s confirmed.`;
    action = (
      <div className="flex gap-4 text-sm font-bold text-link">
        <button className="underline" onClick={() => void verify.refetch()}>
          Try again
        </button>
        <Link to="/app/payments" className="underline">
          View payments
        </Link>
      </div>
    );
  } else if (pay?.status === "Successful") {
    icon = <CheckCircle2 className="size-10 text-status-active" />;
    title = "Payment received";
    body = `Your ${formatMoney(pay.amountMinor, pay.currency)} contribution is confirmed and your plan is now active.`;
    action = (
      <Link
        to="/app/plans/$id"
        params={{ id: pay.plan }}
        className="inline-flex h-12 items-center rounded-xl bg-foreground px-6 text-sm font-bold text-canvas"
      >
        View your plan
      </Link>
    );
  } else if (pay && (pay.status === "Failed" || pay.status === "Cancelled")) {
    icon = <XCircle className="size-10 text-status-cancelled" />;
    title = "That payment didn’t go through";
    body =
      pay.failureMessage ??
      "You haven’t been charged. You can try again whenever you’re ready.";
    action = (
      <Link
        to="/app/payments/new"
        search={{ plan: pay.plan }}
        className="inline-flex h-12 items-center rounded-xl bg-accent px-6 text-sm font-bold text-foreground"
      >
        Try again
      </Link>
    );
  } else if (pay) {
    title = "Your payment is still processing";
    body =
      "We’ll update your plan as soon as it’s confirmed. You can safely leave this page.";
    action = (
      <Link to="/app/payments" className="font-bold text-link underline">
        View payments
      </Link>
    );
  }

  return (
    <main
      className="flex max-w-[540px] flex-col items-start gap-4 p-5 md:p-10 pt-24"
      aria-live="polite"
    >
      {icon}
      <h1 className="font-serif text-[40px] font-normal leading-tight">
        {title}
      </h1>
      <p className="text-muted">{body}</p>
      {action}
    </main>
  );
}
