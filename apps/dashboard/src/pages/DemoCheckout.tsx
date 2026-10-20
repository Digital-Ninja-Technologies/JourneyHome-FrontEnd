import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Lock } from "lucide-react";
import { Logo } from "@journeyhome/ui/components/logo";
import { api } from "../lib/api";
import { formatMoney } from "../lib/format";
import type { Payment } from "../lib/types";

/**
 * Stand-in for Paystack's hosted checkout, used only in demo mode: the payment API sends the browser here
 * and this page reports the chosen outcome, then returns to the normal payment callback.
 */
export default function DemoCheckout() {
  const reference = useSearchParams()[0].get("reference");
  const navigate = useNavigate();
  const payQ = useQuery({ queryKey: ["demo-checkout", reference], queryFn: () => api<Payment>(`/payments/verify/${reference}`, { method: "POST" }), enabled: !!reference, retry: false });
  const finish = useMutation({
    mutationFn: (outcome: "success" | "failed" | "cancelled") => api("/__demo/checkout", { body: { reference, outcome } }),
    onSuccess: () => navigate(`/app/payments/callback?reference=${reference}`, { replace: true }),
  });
  const pay = payQ.data;

  return (
    <div className="flex min-h-screen flex-col items-center bg-canvas px-6 pt-14">
      <Logo />
      <div className="mt-10 flex w-full max-w-[440px] flex-col gap-5 rounded-[28px] bg-white p-8 shadow-sm">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[2px] text-status-due"><Lock className="size-3.5" /> Simulated Paystack checkout</div>
        {!reference && <p className="text-sm text-muted">No payment reference. <Link to="/app/payments" className="font-bold text-link underline">Back to payments</Link></p>}
        {payQ.isPending && reference && <p className="text-sm text-muted">Loading…</p>}
        {payQ.isError && <p role="alert" className="text-sm text-status-cancelled">{payQ.error.message}</p>}
        {pay && (
          <>
            <div>
              <div className="text-sm text-muted">Journey Home · first contribution</div>
              <div className="font-serif text-4xl">{formatMoney(pay.amountMinor, pay.currency)}</div>
              <div className="mt-1 font-mono text-xs text-muted">{pay.reference}</div>
            </div>
            <p className="text-[13px] leading-relaxed text-muted">This is a demo, so no real money moves. Choose how the payment should go:</p>
            <button disabled={finish.isPending} onClick={() => finish.mutate("success")} className="h-12 rounded-xl bg-accent text-sm font-bold text-foreground disabled:opacity-50">
              {finish.isPending ? "Processing…" : `Pay ${formatMoney(pay.amountMinor, pay.currency)}`}
            </button>
            <button disabled={finish.isPending} onClick={() => finish.mutate("failed")} className="h-11 rounded-xl border border-status-cancelled text-sm font-semibold text-status-cancelled disabled:opacity-50">Simulate a declined card</button>
            <button disabled={finish.isPending} onClick={() => finish.mutate("cancelled")} className="text-xs font-semibold text-muted underline">Cancel payment</button>
          </>
        )}
        {finish.isError && <p role="alert" className="text-sm text-status-cancelled">{finish.error.message}</p>}
      </div>
    </div>
  );
}
