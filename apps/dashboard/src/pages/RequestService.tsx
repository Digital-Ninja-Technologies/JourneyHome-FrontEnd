import { useRef, useState } from "react";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Info, Upload, X } from "lucide-react";
import { Button } from "@journeyhome/ui/components/button";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import { Select } from "@journeyhome/ui/components/select";
import { cn } from "@journeyhome/ui/lib/utils";
import { api } from "../lib/api";
import { formatMoney } from "../lib/format";
import { usePlans } from "../lib/queries";
import { DOC_LABEL, ELIGIBLE_PLAN, REQUIRED_DOCS, uploadServiceDocument, validateFile } from "../lib/serviceRequests";
import type { DocumentType, ServiceRequest } from "../lib/types";

const STATES = [
  "Abia", "Abuja (FCT)", "Adamawa", "Akwa Ibom", "Anambra", "Bauchi", "Bayelsa", "Benue", "Borno", "Cross River", "Delta", "Ebonyi",
  "Edo", "Ekiti", "Enugu", "Gombe", "Imo", "Jigawa", "Kaduna", "Kano", "Katsina", "Kebbi", "Kogi", "Kwara", "Lagos", "Nasarawa",
  "Niger", "Ogun", "Ondo", "Osun", "Oyo", "Plateau", "Rivers", "Sokoto", "Taraba", "Yobe", "Zamfara",
];

function Field({ label, id, children, className }: { label: string; id: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function DocPicker({ type, file, onChange }: { type: DocumentType; file?: File; onChange: (f?: File) => void }) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  function pick(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    const problem = validateFile(f);
    setError(problem);
    onChange(problem ? undefined : f);
  }
  return (
    <div className="flex flex-col gap-1.5">
      <div
        className={cn(
          "relative flex min-h-[100px] flex-col items-center justify-center gap-1 rounded-2xl border border-dashed p-4 text-center",
          file ? "border-status-active bg-status-active-bg/40" : "border-link/50",
        )}
      >
        <input ref={ref} type="file" required={!file} accept="application/pdf,image/jpeg,image/png" onChange={pick} aria-label={DOC_LABEL[type]} className="absolute inset-0 cursor-pointer opacity-0" />
        <Upload className="size-4 text-link" />
        <div className="text-sm font-bold">{DOC_LABEL[type]}</div>
        <div className="max-w-full truncate text-xs text-muted">{file ? file.name : "JPG, PNG, or PDF — up to 10MB"}</div>
      </div>
      {file && (
        <button type="button" onClick={() => { onChange(undefined); if (ref.current) ref.current.value = ""; }} className="inline-flex items-center gap-1 self-start text-xs font-semibold text-link">
          <X className="size-3" /> Remove
        </button>
      )}
      {error && <p role="alert" className="text-xs text-status-cancelled">{error}</p>}
    </div>
  );
}

export default function RequestService() {
  const plansQ = usePlans();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { plan: paramPlan } = useSearch({ from: "/app/service-requests/new" });
  const [files, setFiles] = useState<Partial<Record<DocumentType, File>>>({});
  const [progress, setProgress] = useState<string | null>(null);
  // If the request is created but an upload fails, a retry skips creation and uploads what's left.
  const created = useRef<{ id: string; done: Set<DocumentType> } | null>(null);

  const eligible = (plansQ.data ?? []).filter((p) => ELIGIBLE_PLAN.has(p.status));
  const [planId, setPlanId] = useState(paramPlan ?? "");
  const plan = eligible.find((p) => p._id === planId) ?? eligible[0];

  const submit = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (!created.current) {
        const req = await api<ServiceRequest>("/service-requests", { body });
        created.current = { id: req._id, done: new Set() };
      }
      const { id, done } = created.current;
      for (const type of REQUIRED_DOCS) {
        const file = files[type];
        if (!file || done.has(type)) continue;
        setProgress(`Uploading ${DOC_LABEL[type].toLowerCase()}…`);
        await uploadServiceDocument(id, file, type);
        done.add(type);
      }
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      void queryClient.invalidateQueries({ queryKey: ["plan"] });
      void queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      navigate({ to: "/app/service-requests" });
    },
    onSettled: () => setProgress(null),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plan) return;
    const d = new FormData(e.currentTarget);
    const text = (k: string) => String(d.get(k) ?? "").trim();
    const day = (k: string) => new Date(`${text(k)}T00:00:00.000Z`).toISOString();
    const extra = text("info");
    submit.mutate({
      planId: plan._id,
      dateOfDeath: day("dod"),
      expectedBurialDate: day("service"),
      // The backend stores one location string, so the state is folded into it.
      burialLocation: `${text("venue")}, ${text("state")}`,
      contactPerson: text("contact"),
      contactPhone: text("phone"),
      ...(extra && { additionalInformation: extra }),
    });
  }

  const today = new Date().toISOString().slice(0, 10);
  const partial = !!created.current && submit.isError;

  return (
    <main className="flex max-w-[660px] flex-col gap-6 p-5 md:p-10">
      <header className="flex flex-col gap-2">
        <div className="text-sm text-muted">
          <Link to="/app/service-requests" className="hover:underline">Service requests</Link> / New request
        </div>
        <h1 className="font-serif text-[52px] font-normal leading-[1.05]">Request the <span className="italic">service</span></h1>
        <p className="text-sm text-muted">We&rsquo;ll verify your documents and review your request. You&rsquo;ll be notified at every step.</p>
      </header>

      {plansQ.isPending && <p className="text-muted">Loading your plans…</p>}
      {plansQ.isSuccess && eligible.length === 0 && (
        <div className="rounded-2xl bg-white p-6 text-sm leading-relaxed text-ink-soft">
          <div className="mb-1 font-serif text-2xl text-foreground">No plan is ready for a service</div>
          A service can be requested for a plan once it&rsquo;s active. <Link to="/app/plans" className="font-bold text-link underline">Go to my plans</Link>
        </div>
      )}

      {plan && (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <section className="flex flex-col gap-5 rounded-[28px] bg-white p-7">
            <Field label="Which plan is this for?" id="plan">
              <Select id="plan" value={plan._id} onChange={(e) => setPlanId(e.target.value)} disabled={partial}>
                {eligible.map((p) => (
                  <option key={p._id} value={p._id}>
                    {p.coveredPerson.fullName} — {p.packageSnapshot.name} · {formatMoney(p.totalContributedMinor, p.currency)} saved
                  </option>
                ))}
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date of death" id="dod"><Input id="dod" name="dod" type="date" required max={today} /></Field>
              <Field label="Expected date of service" id="service"><Input id="service" name="service" type="date" required min={today} /></Field>
              <Field label="State" id="state">
                <Select id="state" name="state" defaultValue="Lagos">{STATES.map((s) => <option key={s}>{s}</option>)}</Select>
              </Field>
              <Field label="Venue / burial location" id="venue">
                <Input id="venue" name="venue" required minLength={3} placeholder="e.g. St. Peter's Church, Ikeja" />
              </Field>
            </div>
            <hr className="border-border" />
            <div className="text-xs font-bold uppercase tracking-wider text-muted">Contact person on the day</div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" id="contact"><Input id="contact" name="contact" required minLength={2} placeholder="e.g. Chidi Okafor" /></Field>
              <Field label="Phone number" id="phone"><Input id="phone" name="phone" type="tel" required minLength={5} placeholder="e.g. 0803 123 4567" /></Field>
            </div>
            <Field label="Anything we should know? (optional)" id="info">
              <textarea id="info" name="info" rows={3} placeholder="Scale of the event, number of guests, special requests…" className="w-full rounded-xl border border-border bg-background p-3.5 text-sm placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-accent" />
            </Field>
            <hr className="border-border" />
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted">Supporting documents</span>
              <div className="grid gap-4 sm:grid-cols-2">
                {REQUIRED_DOCS.map((type) => (
                  <DocPicker key={type} type={type} file={files[type]} onChange={(f) => setFiles((s) => ({ ...s, [type]: f }))} />
                ))}
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl bg-cream px-5 py-4 text-[13px] leading-relaxed text-status-due">
            <Info className="mt-0.5 size-4 shrink-0" />
            <div>Submitting this request moves {plan.coveredPerson.fullName}&rsquo;s plan into service review.</div>
          </div>

          {submit.isError && (
            <p role="alert" className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled">
              {partial ? "Your request was submitted, but a document didn’t upload. " : ""}
              {submit.error.message}
              {partial ? " Press the button to retry the upload." : ""}
            </p>
          )}
          <div className="flex gap-3">
            <Button type="button" variant="outline" size="lg" className="h-[54px] rounded-xl" onClick={() => navigate({ to: "/app/service-requests" })} disabled={submit.isPending}>
              {partial ? "Skip for now" : "Cancel"}
            </Button>
            <Button type="submit" variant="accent" size="lg" className="h-[54px] flex-1 rounded-xl" disabled={submit.isPending}>
              {submit.isPending ? (progress ?? "Submitting…") : partial ? "Retry upload" : "Submit request"}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
