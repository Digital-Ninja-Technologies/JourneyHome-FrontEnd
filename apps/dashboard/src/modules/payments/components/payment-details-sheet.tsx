import type { Payment, Plan } from "@journeyhome/schemas";
import { Button, buttonVariants } from "@journeyhome/ui/components/button";
import { ResponsiveDetailsView } from "@journeyhome/ui/components/responsive-details-view";
import { toast } from "@journeyhome/ui/components/toast";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Copy, RotateCcw, ShieldAlert } from "lucide-react";
import { Pill, planStatusLabel, type Tone } from "@/components/status-pill";
import { capitalise, formatDate, formatMoney } from "@/lib/format";

export interface PaymentDetailsSheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  payment: Payment | null;
  plan?: Plan;
}

const PURPOSE_LABEL: Record<string, string> = {
  initial_contribution: "First contribution",
  recurring_contribution: "Monthly contribution",
};

const purposeLabel = (purpose: string) =>
  PURPOSE_LABEL[purpose] ??
  capitalise(purpose.replace(/_/g, " ").toLowerCase());

const PAYMENT_TONE: Record<Payment["status"], Tone> = {
  Successful: "active",
  Pending: "due",
  Processing: "due",
  Failed: "cancelled",
  Refunded: "paused",
  Cancelled: "paused",
};

const formatWhen = (iso: string) =>
  `${formatDate(iso)}, ${new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })}`;

/** A titled group of label/value rows. */
function Section({
  title,
  action,
  children,
}: {
  title: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="mb-2 flex items-center justify-between px-1">
        <h3 className="text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground">
          {title}
        </h3>
        {action}
      </div>
      <dl className="divide-y divide-border/60 rounded-2xl border border-border/60 px-4">
        {children}
      </dl>
    </section>
  );
}

function Row({
  label,
  children,
}: {
  label: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between gap-4 py-3">
      <dt className="w-28 shrink-0 text-xs text-muted-foreground">{label}</dt>
      <dd className="min-w-0 flex-1 text-right text-sm font-medium">
        {children || "—"}
      </dd>
    </div>
  );
}

/** Monospace identifier on its own line with a copy button. Wraps instead of squashing. */
function IdRow({ label, value }: { label: string; value: string }) {
  const handleCopy = () => {
    void navigator.clipboard.writeText(value);
    toast.add({ title: `${label} copied`, type: "success" });
  };

  return (
    <div className="py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 flex items-start justify-between gap-3">
        <span className="min-w-0 break-all font-mono text-[13px] leading-snug">
          {value}
        </span>
        <button
          type="button"
          onClick={handleCopy}
          className="-mr-1.5 -mt-1 shrink-0 cursor-pointer rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          aria-label={`Copy ${label.toLowerCase()}`}
          title={`Copy ${label.toLowerCase()}`}
        >
          <Copy className="size-3.5" />
        </button>
      </dd>
    </div>
  );
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

  return (
    <ResponsiveDetailsView
      open={open}
      onOpenChange={onOpenChange}
      title="Payment details"
      description={formatWhen(payment.createdAt)}
      footer={
        <div className="flex w-full items-center justify-between gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onOpenChange(false)}
            className="rounded-full px-4 text-xs"
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
                "gap-1.5 rounded-full px-4 text-xs font-semibold",
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
                "gap-1.5 rounded-full px-4 text-xs font-semibold",
              )}
            >
              <span>View plan</span>
              <ArrowRight className="size-3.5" />
            </Link>
          )}
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Amount + the one status badge */}
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {purposeLabel(payment.purpose)}
            </span>
            <Pill
              label={payment.status}
              tone={PAYMENT_TONE[payment.status] ?? "paused"}
              className="px-2.5 py-0.5 text-[11px]"
            />
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {formatMoney(payment.amount, payment.currency)}
          </p>
        </div>

        {(isFailed || failureMsg) && (
          <div className="space-y-1.5 rounded-2xl border border-destructive/20 bg-destructive/10 p-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-destructive">
              <ShieldAlert className="size-4 shrink-0" />
              <span>Why this payment failed</span>
            </div>
            {failureMsg && (
              <p className="text-xs font-medium leading-relaxed text-destructive/90">
                {failureMsg}
              </p>
            )}
          </div>
        )}

        <Section title="Transaction">
          <IdRow label="Reference" value={payment.reference} />
          {payment.providerReference && (
            <IdRow
              label="Provider reference"
              value={payment.providerReference}
            />
          )}
          {payment.providerTransactionId && (
            <IdRow
              label="Transaction ID"
              value={payment.providerTransactionId}
            />
          )}
          <Row label="Payment method">
            <span className="capitalize">{payment.provider || "Paystack"}</span>
          </Row>
          <Row label="Created">{formatWhen(payment.createdAt)}</Row>
          <Row label="Paid">
            {payment.processedAt ? (
              formatWhen(payment.processedAt)
            ) : (
              <span className="font-normal text-muted-foreground">
                Awaiting verification
              </span>
            )}
          </Row>
        </Section>

        {plan && (
          <Section
            title="Plan"
            action={
              <Link
                to="/app/plans/$id"
                params={{ id: plan._id }}
                onClick={() => onOpenChange(false)}
                className="inline-flex items-center gap-1 text-xs font-semibold text-link hover:underline"
              >
                <span>View plan</span>
                <ArrowRight className="size-3" />
              </Link>
            }
          >
            <Row label="Covers">{plan.coveredPerson.fullName}</Row>
            <Row label="Relationship">
              {capitalise(plan.coveredPerson.relationship)}
            </Row>
            <Row label="Package">{plan.packageDetails.name}</Row>
            <Row label="Status">{planStatusLabel(plan.status)}</Row>
          </Section>
        )}
      </div>
    </ResponsiveDetailsView>
  );
}
