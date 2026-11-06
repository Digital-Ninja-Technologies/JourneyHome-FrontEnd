import type { AdminPayment } from "@journeyhome/schemas";
import { buttonVariants } from "@journeyhome/ui/components/button";
import { ResponsiveDetailsView } from "@journeyhome/ui/components/responsive-details-view";
import { toast } from "@journeyhome/ui/components/toast";
import { cn } from "@journeyhome/ui/lib/utils";
import { Link } from "@tanstack/react-router";
import { ArrowRight, Copy } from "lucide-react";
import { PaymentStatusPill } from "@/components/status-pill";
import {
  capitalise,
  formatDateTime,
  formatMoney,
  humanise,
} from "@/lib/format";
import { PURPOSE_LABEL, planLabel } from "../payments.utils";

function copy(value: string, label: string) {
  void navigator.clipboard.writeText(value);
  toast.add({ title: `${label} copied`, type: "success" });
}

/** A titled group of label/value rows. */
function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <h3 className="mb-2 px-1 text-[11px] font-semibold uppercase tracking-[2px] text-muted-foreground">
        {title}
      </h3>
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
      <dt className="w-24 shrink-0 pt-px text-xs text-muted-foreground">
        {label}
      </dt>
      <dd className="min-w-0 flex-1 text-right text-sm font-medium">
        {children || "—"}
      </dd>
    </div>
  );
}

/** Monospace identifier on its own line with a copy button. Wraps instead of squashing. */
function IdRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="py-3">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-1.5 flex items-start justify-between gap-3">
        <span className="min-w-0 break-all font-mono text-[13px] leading-snug">
          {value}
        </span>
        <button
          type="button"
          onClick={() => copy(value, label)}
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
  payment,
  onOpenChange,
}: {
  payment: AdminPayment | null;
  onOpenChange: (open: boolean) => void;
}) {
  if (!payment) return null;
  const p = payment;
  const purpose = PURPOSE_LABEL[p.purpose] ?? humanise(p.purpose);

  return (
    <ResponsiveDetailsView
      open={Boolean(payment)}
      onOpenChange={onOpenChange}
      title="Payment details"
      description={formatDateTime(p.createdAt)}
      footer={
        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          <Link
            to="/users/$id"
            params={{ id: p.owner._id }}
            className={cn(
              buttonVariants({ variant: "outline", size: "sm" }),
              "rounded-full px-4 text-xs",
            )}
          >
            View customer
          </Link>
          <Link
            to="/plans/$id"
            params={{ id: p.plan._id }}
            className={cn(
              buttonVariants({ variant: "default", size: "sm" }),
              "gap-1.5 rounded-full px-4 text-xs",
            )}
          >
            View plan
            <ArrowRight className="size-3.5" />
          </Link>
        </div>
      }
    >
      <div className="flex flex-col gap-6">
        {/* Amount + the one status badge */}
        <div className="rounded-2xl border border-border/60 bg-muted/40 p-5">
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs font-medium text-muted-foreground">
              {purpose}
            </span>
            <PaymentStatusPill status={p.status} />
          </div>
          <p className="mt-2 text-3xl font-bold tabular-nums">
            {formatMoney(p.amount, p.currency)}
          </p>
        </div>

        <Section title="Transaction">
          <IdRow label="Reference" value={p.reference} />
          <IdRow label="Payment ID" value={p._id} />
          <Row label="Date">{formatDateTime(p.createdAt)}</Row>
        </Section>

        <Section title="Customer">
          <Row label="Name">{p.owner.name}</Row>
          <Row label="Email">
            <span className="break-all">{p.owner.email}</span>
          </Row>
        </Section>

        <Section title="Plan">
          <Row label="Covers">{planLabel(p)}</Row>
          <Row label="Relationship">
            {p.plan.coveredPerson
              ? capitalise(p.plan.coveredPerson.relationship)
              : null}
          </Row>
          <Row label="Package">{p.plan.packageDetails?.name}</Row>
        </Section>
      </div>
    </ResponsiveDetailsView>
  );
}
