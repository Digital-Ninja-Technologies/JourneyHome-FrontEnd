import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@journeyhome/ui/components/button";
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "@journeyhome/ui/components/dialog";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Select } from "@journeyhome/ui/components/select";
import { cn } from "@journeyhome/ui/lib/utils";
import { api } from "../lib/api";
import { formatMoney } from "../lib/format";
import { usePackages } from "../lib/queries";
import type { Plan } from "../lib/types";

const RELATIONSHIPS = ["Mother", "Father", "Grandparent", "Uncle / Aunt", "Other"];

function Field({ label, htmlFor, children, className }: { label: string; htmlFor: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

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
      navigate(`/app/plans/${plan._id}`);
    },
  });

  const selected = packagesQ.data?.find((p) => p._id === packageId);

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!selected) return;
    const d = new FormData(e.currentTarget);
    const text = (k: string) => String(d.get(k) ?? "").trim();
    const location = text("location");
    create.mutate({
      packageId: selected._id,
      coveredPerson: {
        fullName: text("fullName"),
        relationship: text("relationship").toLowerCase(),
        dateOfBirth: new Date(`${text("dob")}T00:00:00.000Z`).toISOString(),
        gender: text("gender").toLowerCase(),
        ...(text("phone") && { phoneNumber: text("phone") }),
        // The backend stores a single address string, so state/location is folded into it.
        address: location ? `${text("address")}, ${location}` : text("address"),
      },
    });
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
          <fieldset className="flex flex-col gap-4">
            <legend className="mb-3 text-base font-bold">Who is this plan for?</legend>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" htmlFor="fullName">
                <Input id="fullName" name="fullName" required minLength={2} placeholder="e.g. Adunni Okafor" />
              </Field>
              <Field label="Relationship" htmlFor="relationship">
                <Select id="relationship" name="relationship" defaultValue="Mother">
                  {RELATIONSHIPS.map((r) => <option key={r}>{r}</option>)}
                </Select>
              </Field>
              <Field label="Date of birth" htmlFor="dob">
                <Input id="dob" name="dob" type="date" required max={new Date().toISOString().slice(0, 10)} />
              </Field>
              <Field label="Gender" htmlFor="gender">
                <Select id="gender" name="gender" defaultValue="Female">
                  <option>Female</option>
                  <option>Male</option>
                </Select>
              </Field>
              <Field label="Phone number" htmlFor="phone">
                <Input id="phone" name="phone" type="tel" placeholder="e.g. 0803 123 4567" />
              </Field>
              <Field label="State / location" htmlFor="location">
                <Input id="location" name="location" placeholder="e.g. Lagos" />
              </Field>
              <Field label="Home address" htmlFor="address" className="sm:col-span-2">
                <Input id="address" name="address" required minLength={5} placeholder="e.g. 14 Awolowo Road, Ikoyi" />
              </Field>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-3">
            <legend className="mb-3 text-base font-bold">Choose a package</legend>
            {packagesQ.isPending && <p className="text-sm text-muted">Loading packages…</p>}
            {packagesQ.isError && <p className="text-sm text-status-cancelled">Couldn&rsquo;t load packages. Please close this and try again.</p>}
            <div className="grid gap-3 sm:grid-cols-3">
              {packagesQ.data?.map((p) => (
                <label
                  key={p._id}
                  className={cn(
                    "flex cursor-pointer flex-col gap-2 rounded-2xl border p-4",
                    packageId === p._id ? "border-foreground bg-white ring-1 ring-foreground" : "border-border bg-background",
                  )}
                >
                  <div className="flex items-center justify-between text-sm font-bold">
                    {p.name}
                    <input type="radio" name="package" value={p._id} required checked={packageId === p._id} onChange={() => setPackageId(p._id)} />
                  </div>
                  <div className="text-xl font-bold tracking-tight">
                    {formatMoney(p.monthlyContributionMinor, p.currency)}
                    <span className="text-xs font-normal text-muted">/mo</span>
                  </div>
                </label>
              ))}
            </div>
            <p className="text-xs text-muted">The package is fixed for the life of a plan and can&rsquo;t be changed once started.</p>
          </fieldset>

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
