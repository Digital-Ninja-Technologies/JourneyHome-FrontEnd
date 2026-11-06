import type { Payment, Plan } from "@journeyhome/schemas";
import { Badge } from "@journeyhome/ui/components/badge";
import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { ResponsiveDetailsView } from "@journeyhome/ui/components/responsive-details-view";
import { toast } from "@journeyhome/ui/components/toast";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import {
  AlertCircle,
  ArrowRight,
  CheckCircle,
  Clock,
  Copy,
  CreditCard,
  RotateCcw,
  ShieldAlert,
  XCircle,
} from "lucide-react";
import { firstName, formatDay, formatMoney } from "@/lib/format";

export interface PaymentDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  plan?: Plan;
}

function StatusBadge({ status }: { status: Payment["status"] }) {
  switch (status) {
    case "Successful":
      return (
        <Badge
          variant="outline"
          className="border-status-active-bg bg-status-active-bg text-status-active text-[11px] font-semibold gap-1 py-0.5 px-2"
        >
          <CheckCircle className="size-3" />
          <span>Successful</span>
        </Badge>
      );
    case "Pending":
    case "Processing":
      return (
        <Badge
          variant="outline"
          className="border-status-pending-bg bg-status-pending-bg text-status-pending text-[11px] font-semibold gap-1 py-0.5 px-2"
        >
          <Clock className="size-3" />
          <span>{status}</span>
        </Badge>
      );
    case "Failed":
      return (
        <Badge
          variant="outline"
          className="border-status-cancelled-bg bg-status-cancelled-bg text-status-cancelled text-[11px] font-semibold gap-1 py-0.5 px-2"
        >
          <XCircle className="size-3" />
          <span>Failed</span>
        </Badge>
      );
    default:
      return (
        <Badge
          variant="outline"
          className="border-border bg-muted/40 text-muted-foreground text-[11px] font-semibold gap-1 py-0.5 px-2"
        >
          <AlertCircle className="size-3" />
          <span>{status}</span>
        </Badge>
      );
  }
}

export function PaymentDetailsSheet({
  open,
  onOpenChange,
  payment,
  plan,
}: PaymentDetailsSheetProps) {
  if (!payment) return null;

  const failureMsg =
    (payment as unknown as { failureMessage?: string }).failureMessage ||
    (payment.metadata?.message as string) ||
    (payment.metadata?.gateway_response as string) ||
    null;

  const isFailed = payment.status === "Failed";

  const canResume =
    plan?.status === "Pending" &&
    payment.purpose === "initial_contribution" &&
    payment.status !== "Successful" &&
    payment.status !== "Refunded";

  const resumeLabel =
    payment.status === "Failed" || payment.status === "Cancelled"
      ? "Retry payment"
      : "Complete payment";

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.add({
      title: `${label} copied to clipboard`,
      type: "success",
    });
  };

  return (
    <ResponsiveDetailsView
      open={open}
      onOpenChange={onOpenChange}
      headerExtra={
        <div className="flex flex-wrap items-center gap-2">
          <StatusBadge status={payment.status} />
          {plan && (
            <Badge variant="secondary" className="text-[10px] font-semibold">
              {plan.packageDetails.name}
            </Badge>
          )}
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-mono text-muted-foreground"
          >
            {payment.provider || "paystack"}
          </Badge>
        </div>
      }
      title={
        <div className="flex items-center gap-2 text-foreground font-mono text-sm sm:text-base break-all">
          <span>{payment.reference}</span>
          <button
            type="button"
            onClick={() => handleCopy(payment.reference, "Reference")}
            className="text-muted-foreground hover:text-foreground cursor-pointer transition-colors p-1"
            title="Copy reference"
          >
            <Copy className="size-3.5" />
          </button>
        </div>
      }
      description={
        plan ? (
          <span>
            Journey Home Plan · {firstName(plan.coveredPerson.fullName)} (
            {plan.coveredPerson.relationship})
          </span>
        ) : (
          <span>Transaction record</span>
        )
      }
      footer={
        <div className="flex items-center justify-between w-full gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-full text-xs px-4"
          >
            Close
          </Button>

          {canResume && plan && (
            <Link
              to="/app/payments/new"
              search={{ plan: plan._id }}
              onClick={() => onOpenChange(false)}
              className={cn(
                buttonVariants({ variant: "default", size: "sm" }),
                "rounded-full text-xs font-semibold gap-1.5 px-4",
              )}
            >
              <RotateCcw className="size-3.5" />
              <span>{resumeLabel}</span>
            </Link>
          )}

          {plan && !canResume && (
            <Link
              to="/app/plans/$id"
              params={{ id: plan._id }}
              onClick={() => onOpenChange(false)}
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "rounded-full text-xs font-semibold gap-1.5 px-4",
              )}
            >
              <span>View plan</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        {/* Amount & Overview Card */}
        <div className="p-4 sm:p-5 rounded-2xl bg-muted/40 border border-border/60 space-y-3">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-muted-foreground font-medium">
              Amount
            </span>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-bold text-foreground tabular-nums">
                {formatMoney(payment.amount, payment.currency)}
              </span>
              <span className="block text-[11px] text-muted-foreground font-mono">
                {payment.currency}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 pt-3 border-t border-border/40 text-xs">
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">
                Created At
              </span>
              <span className="font-semibold text-foreground">
                {formatDay(payment.createdAt)}{" "}
                {new Date(payment.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
            <div>
              <span className="text-muted-foreground block text-[11px] mb-0.5">
                Paid At
              </span>
              <span className="font-semibold text-foreground">
                {payment.processedAt
                  ? `${formatDay(payment.processedAt)} ${new Date(payment.processedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`
                  : "Pending verification"}
              </span>
            </div>
          </div>
        </div>

        {/* Failure & Mismatch Analysis */}
        {(isFailed || failureMsg) && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 space-y-2">
            <div className="flex items-center gap-2 text-destructive font-semibold text-xs">
              <ShieldAlert className="size-4 shrink-0" />
              <span>Failure Analysis</span>
            </div>
            {failureMsg && (
              <p className="text-xs text-destructive/90 leading-relaxed font-medium">
                {failureMsg}
              </p>
            )}
          </div>
        )}

        {/* Payment Breakdown Card */}
        <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3">
          <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Payment Breakdown
          </span>

          <div className="space-y-2.5 text-xs">
            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground flex items-center gap-1.5">
                <CreditCard className="size-3.5" />
                <span>Payment Channel</span>
              </span>
              <span className="font-medium text-foreground capitalize">
                {payment.provider || "Paystack"}
              </span>
            </div>

            <div className="flex items-center justify-between py-1 border-b border-border/40">
              <span className="text-muted-foreground">Purpose</span>
              <span className="font-medium text-foreground">
                {payment.purpose === "initial_contribution"
                  ? "First Contribution"
                  : "Monthly Recurring Contribution"}
              </span>
            </div>

            {payment.providerReference && (
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Provider Ref</span>
                <span className="font-mono text-[11px] text-foreground">
                  {payment.providerReference}
                </span>
              </div>
            )}

            {payment.providerTransactionId && (
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Transaction ID</span>
                <span className="font-mono text-[11px] text-foreground">
                  {payment.providerTransactionId}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Associated Plan Card */}
        {plan && (
          <div className="p-4 rounded-2xl bg-card border border-border/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider">
                Associated Plan
              </span>
              <Link
                to="/app/plans/$id"
                params={{ id: plan._id }}
                onClick={() => onOpenChange(false)}
                className="text-xs font-semibold text-link hover:underline inline-flex items-center gap-1"
              >
                <span>View plan</span>
                <ArrowRight className="size-3" />
              </Link>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Covered Person</span>
                <span className="font-semibold text-foreground">
                  {plan.coveredPerson.fullName} (
                  {plan.coveredPerson.relationship})
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-border/40">
                <span className="text-muted-foreground">Package</span>
                <span className="font-medium text-foreground">
                  {plan.packageDetails.name}
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-muted-foreground">Plan Status</span>
                <Badge variant="outline" className="text-[10px] font-semibold">
                  {plan.status}
                </Badge>
              </div>
            </div>
          </div>
        )}
      </div>
    </ResponsiveDetailsView>
  );
}
