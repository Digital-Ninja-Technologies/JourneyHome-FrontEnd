import { useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@journeyhome/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@journeyhome/ui/components/dialog";
import { api } from "../lib/api";
import { formatMoney } from "../lib/format";
import { usePackages } from "../lib/queries";
import { CoveredPersonFields, PackagePicker, planRequestBody } from "./PlanFormParts";
import type { Plan } from "../lib/types";

export function CreatePlanDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const packagesQ = usePackages();
  const [packageId, setPackageId] = useState<string>("");

  const create = useMutation({
    mutationFn: (body: unknown) => api<Plan>("/plans", { body }),
    onSuccess: (plan) => {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      onClose();
      navigate({ to: "/app/plans/$id", params: { id: plan._id } });
    },
  });

  const selected = packagesQ.data?.find((p) => p._id === packageId);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (selected) create.mutate(planRequestBody(e.currentTarget, selected._id));
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[92vh] max-w-2xl gap-6 overflow-y-auto rounded-3xl p-8">
        <div>
          <div className="text-xs font-extrabold uppercase tracking-[2px] text-link">New plan</div>
          <DialogTitle className="font-serif text-4xl font-normal">
            Start a new <span className="italic">plan</span>
          </DialogTitle>
          <DialogDescription className="mt-1">You&rsquo;ll make the first contribution on the next step.</DialogDescription>
        </div>
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <CoveredPersonFields />
          <PackagePicker value={packageId} onChange={setPackageId} />
          <p className="-mt-3 text-xs text-muted">The package is fixed for the life of a plan and can&rsquo;t be changed once started.</p>

          {create.isError && (
            <p role="alert" className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">
              {create.error.message}
            </p>
          )}
          <div className="flex justify-end gap-3">
            <Button type="button" variant="outline" size="lg" onClick={onClose}>Cancel</Button>
            <Button type="submit" variant="accent" size="lg" disabled={!selected || create.isPending}>
              {create.isPending ? "Creating…" : selected ? `Create plan — ${formatMoney(selected.monthlyContributionMinor, selected.currency)}/mo` : "Create plan"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
