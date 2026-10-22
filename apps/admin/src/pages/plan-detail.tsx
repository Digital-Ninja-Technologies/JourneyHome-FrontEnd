import { Button } from "@journeyhome/ui/components/button";
import { Select } from "@journeyhome/ui/components/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  Card,
  CardTitle,
  Field,
  PageHeader,
  Pill,
  QueryError,
} from "@/components/ui";
import { api } from "@/lib/api";
import {
  ageFrom,
  capitalise,
  formatDate,
  formatMoney,
  formatMonthYear,
} from "@/lib/format";
import { useDirectory, usePlan } from "@/lib/queries";
import { PLAN_STATUS, PLAN_TRANSITIONS } from "@/lib/status";
import type { PlanStatus } from "@/lib/types";

export default function PlanDetail() {
  const { id } = useParams();
  const planQ = usePlan(id);
  const dir = useDirectory();
  const queryClient = useQueryClient();
  const [next, setNext] = useState<PlanStatus | "">("");
  const [saved, setSaved] = useState(false);

  const save = useMutation({
    mutationFn: (status: PlanStatus) =>
      api(`/plans/${id}/status`, { method: "PATCH", body: { status } }),
    onSuccess: () => {
      setNext("");
      setSaved(true);
      void queryClient.invalidateQueries({ queryKey: ["plan"] });
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
    },
  });

  if (planQ.isPending)
    return <main className="p-10 text-muted">Loading plan…</main>;
  if (planQ.isError)
    return (
      <main className="p-10">
        <QueryError error={planQ.error} retry={() => void planQ.refetch()} />
      </main>
    );

  const plan = planQ.data;
  const [label, tone] = PLAN_STATUS[plan.status];
  const options = PLAN_TRANSITIONS[plan.status];
  const person = plan.coveredPerson;
  const money = (n: number) => formatMoney(n, plan.currency);

  return (
    <main className="flex flex-col gap-6 p-10">
      <div className="flex flex-wrap items-center gap-3">
        <PageHeader
          crumb={
            <>
              <Link to="/plans" className="hover:underline">
                Plans
              </Link>{" "}
              / {person.fullName}
            </>
          }
          title={`${person.fullName}'s plan`}
        />
        <Pill label={label} tone={tone} className="mt-5" />
      </div>
      <div className="grid items-start gap-6 xl:grid-cols-[1.7fr_1fr]">
        <div className="flex flex-col gap-6">
          <Card>
            <CardTitle className="mb-5">Plan details</CardTitle>
            <div className="grid gap-6 sm:grid-cols-3">
              <Field label="Plan owner">
                <Link to={`/users/${plan.owner}`} className="hover:underline">
                  {dir.nameOf(plan.owner)}
                </Link>
              </Field>
              <Field label="Package">{plan.packageSnapshot.name}</Field>
              <Field label="Plan started">
                {formatMonthYear(plan.startDate)}
              </Field>
              <Field label="Balance">{money(plan.totalContributedMinor)}</Field>
              <Field label="Monthly contribution">
                {money(plan.contributionAmountMinor)}
              </Field>
              <Field label="Next payment">
                {plan.status === "Pending"
                  ? "—"
                  : formatDate(plan.nextPaymentDate)}
              </Field>
            </div>
          </Card>
          <Card>
            <CardTitle className="mb-5">Covered person</CardTitle>
            <div className="grid gap-6 sm:grid-cols-3">
              <Field label="Full name">{person.fullName}</Field>
              <Field label="Date of birth">
                {person.dateOfBirth
                  ? `${formatDate(person.dateOfBirth)} · ${ageFrom(person.dateOfBirth)} yrs`
                  : undefined}
              </Field>
              <Field label="Gender">{capitalise(person.gender ?? "")}</Field>
              <Field label="Relationship to owner">
                {capitalise(person.relationship)}
              </Field>
              <Field label="Phone">{person.phoneNumber}</Field>
              <Field label="Home address">{person.address}</Field>
            </div>
          </Card>
        </div>

        <Card className="bg-foreground text-canvas">
          <CardTitle className="mb-4 text-canvas">Status</CardTitle>
          {options.length === 0 ? (
            <p className="text-sm text-canvas/70">
              This plan is {label.toLowerCase()} and can&rsquo;t change status
              any further.
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (next) save.mutate(next);
              }}
              className="flex flex-col gap-3"
            >
              <label
                htmlFor="status"
                className="text-xs font-semibold uppercase tracking-[2px] text-canvas/70"
              >
                Update status
              </label>
              <Select
                id="status"
                value={next}
                onChange={(e) => {
                  setNext(e.target.value as PlanStatus);
                  setSaved(false);
                }}
                className="border-canvas/15 bg-sidebar text-canvas"
              >
                <option value="">{label} (current)</option>
                {options.map((s) => (
                  <option key={s} value={s}>
                    {PLAN_STATUS[s][0]}
                  </option>
                ))}
              </Select>
              <Button
                type="submit"
                variant="accent"
                size="lg"
                disabled={!next || save.isPending}
                className="h-12 rounded-xl"
              >
                {save.isPending ? "Saving…" : "Save status"}
              </Button>
              {save.isError && (
                <p
                  role="alert"
                  className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
                >
                  {save.error.message}
                </p>
              )}
              {saved && (
                <p className="text-[13px] text-[#9FE0BC]">Status updated.</p>
              )}
            </form>
          )}
        </Card>
      </div>
    </main>
  );
}
