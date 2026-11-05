import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { toast } from "@journeyhome/ui/components/toast";
import { cn } from "@journeyhome/ui/lib/utils";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link, Navigate, useSearch } from "@tanstack/react-router";
import { CheckCircle2, Clock, XCircle } from "lucide-react";
import { useEffect } from "react";
import { formatMoney } from "@/lib/format";
import { clearStoredSelectedPackage } from "@/modules/onboarding/storage";
import { verifyPayment } from "@/modules/payments/api";
import {
  getOnboardingPlan,
  setOnboardingPlan,
} from "@/modules/payments/checkout";

export function PaymentCallbackView() {
  const search = useSearch({ from: "/app/payments/callback" });
  const reference = search.reference ?? search.trxref;
  const queryClient = useQueryClient();

  const verify = useQuery({
    queryKey: ["verify-payment", reference],
    queryFn: () =>
      reference
        ? verifyPayment(reference)
        : Promise.reject(new Error("No reference")),
    enabled: !!reference,
    retry: false,
    staleTime: Infinity,
  });

  useEffect(() => {
    if (verify.isSuccess && verify.data) {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      void queryClient.invalidateQueries({ queryKey: ["plan"] });
      void queryClient.invalidateQueries({ queryKey: ["payments"] });
      if (verify.data.status === "Successful") {
        toast.add({
          type: "success",
          title: "Payment confirmed",
          description: "Your contribution has been received successfully.",
        });
      } else if (verify.data.status === "Failed") {
        toast.add({
          type: "error",
          title: "Payment unsuccessful",
          description: "The transaction was not completed. Please try again.",
        });
      }
    }
  }, [verify.isSuccess, verify.data, queryClient]);

  const pay = verify.data;

  // A new customer finishing onboarding continues to the welcome screen.
  if (
    pay?.status === "Successful" &&
    pay.purpose === "initial_contribution" &&
    getOnboardingPlan() === pay.plan
  ) {
    setOnboardingPlan(null);
    clearStoredSelectedPackage();
    return <Navigate to="/welcome" search={{ plan: pay.plan }} replace />;
  }
  let icon = <Clock className="size-10 text-status-due" />;
  let title = "Confirming your payment…";
  let body = "Please don’t close this page.";
  let action = null as React.ReactNode;

  if (!reference) {
    setOnboardingPlan(null);
    clearStoredSelectedPackage();
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
        <Button
          type="button"
          variant="link"
          size="sm"
          className="h-auto p-0 font-bold underline text-link"
          onClick={() => void verify.refetch()}
        >
          Try again
        </Button>
        <Link to="/app/payments" className="underline">
          View payments
        </Link>
      </div>
    );
  } else if (pay?.status === "Successful") {
    setOnboardingPlan(null);
    clearStoredSelectedPackage();
    icon = <CheckCircle2 className="size-10 text-status-active" />;
    title = "Payment received";
    body = `Your ${formatMoney(pay.amount, pay.currency)} contribution is confirmed and your plan is now active.`;
    action = (
      <Link
        to="/app/plans/$id"
        params={{ id: pay.plan }}
        className={cn(
          buttonVariants({ variant: "default", size: "lg" }),
          "h-12 rounded-xl px-6 text-sm font-bold text-canvas",
        )}
      >
        View your plan
      </Link>
    );
  } else if (pay && (pay.status === "Failed" || pay.status === "Cancelled")) {
    setOnboardingPlan(null);
    clearStoredSelectedPackage();
    icon = <XCircle className="size-10 text-status-cancelled" />;
    title = "That payment didn’t go through";
    body =
      (pay as any).failureMessage ??
      "You haven’t been charged. You can try again whenever you’re ready.";
    action = (
      <Link
        to="/app/payments/new"
        search={{ plan: pay.plan }}
        className={cn(
          buttonVariants({ variant: "accent", size: "lg" }),
          "h-12 rounded-xl px-6 text-sm font-bold text-foreground",
        )}
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
      className="flex flex-1 flex-col items-start gap-4 max-w-xl pt-12"
      aria-live="polite"
    >
      {icon}
      <h1 className="font-serif text-[40px] font-normal leading-tight">
        {title}
      </h1>
      <p className="text-muted-foreground">{body}</p>
      {action}
    </main>
  );
}

export default PaymentCallbackView;
