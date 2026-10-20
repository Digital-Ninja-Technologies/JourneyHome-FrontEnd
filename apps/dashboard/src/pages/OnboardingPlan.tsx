import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@journeyhome/ui/components/button";
import { OnboardingShell } from "../components/OnboardingShell";
import { CoveredPersonFields, PackagePicker, planRequestBody } from "../components/PlanFormParts";
import { api } from "../lib/api";
import { formatMoney } from "../lib/format";
import { MARKETING_URL } from "../lib/plans";
import { usePackages } from "../lib/queries";
import type { Plan } from "../lib/types";

export default function OnboardingPlan() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const packagesQ = usePackages();
  const [packageId, setPackageId] = useState("");
  const selected = packagesQ.data?.find((p) => p._id === packageId);

  const create = useMutation({
    mutationFn: (body: unknown) => api<Plan>("/plans", { body }),
    onSuccess: (plan) => {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      navigate(`/signup/payment?plan=${plan._id}`);
    },
  });

  return (
    <OnboardingShell step={3} title="Set up your first" accent="plan." subtitle="Who are you saving for? You can add more plans later, any time." exitTo="/app">
      <form
        onSubmit={(e) => { e.preventDefault(); if (selected) create.mutate(planRequestBody(e.currentTarget, selected._id)); }}
        className="flex flex-col gap-6"
      >
        <section className="flex flex-col gap-6 rounded-[28px] bg-white p-7 shadow-sm">
          <CoveredPersonFields />
          <hr className="border-border" />
          <PackagePicker value={packageId} onChange={setPackageId} />
          <a href={`${MARKETING_URL}/pricing`} className="self-start text-xs font-semibold underline">Compare full package details</a>
        </section>
        {create.isError && (
          <p role="alert" className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">{create.error.message}</p>
        )}
        <Button type="submit" size="lg" disabled={!selected || create.isPending} className="h-[54px] rounded-2xl">
          {create.isPending ? "Creating your plan…" : selected ? `Continue to payment — ${formatMoney(selected.monthlyContributionMinor, selected.currency)} →` : "Continue to payment →"}
        </Button>
        <Link to="/app" className="text-center text-xs font-semibold text-muted underline">Skip for now — I&rsquo;ll set up a plan later</Link>
      </form>
    </OnboardingShell>
  );
}
