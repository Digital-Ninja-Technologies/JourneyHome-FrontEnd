import type { DocumentType, Plan } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { DatePicker } from "@journeyhome/ui/components/date-picker";
import { Input } from "@journeyhome/ui/components/input";
import { Label } from "@journeyhome/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@journeyhome/ui/components/select";
import { cn } from "@journeyhome/ui/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Info, Upload, X } from "lucide-react";
import { useRef, useState } from "react";
import { RequestServiceSkeleton } from "@/components/skeletons";
import { formatMoney } from "@/lib/format";
import { usePlans } from "@/modules/plans/query-options";
import { createServiceRequest } from "@/modules/service-requests/api";
import {
  DOC_LABEL,
  ELIGIBLE_PLAN,
  REQUIRED_DOCS,
  uploadServiceDocument,
  validateFile,
} from "@/modules/service-requests/service-requests.utils";

// TEMP TOGGLE: Set to false to revert back to requiring an active plan.
export const BYPASS_PLAN_REQUIREMENT = true;

const PREVIEW_FALLBACK_PLAN: Plan = {
  _id: "preview-plan-id",
  owner: "demo-cust-1",
  package: "pkg_tier_1",
  packageDetails: {
    packageId: "pkg_tier_1",
    name: "Standard",
    amount: 500000,
    currency: "NGN",
    description: "Standard package",
    features: [],
  },
  status: "Active",
  currency: "NGN",
  amount: 500000,
  totalContributedAmount: 1500000,
  billingInterval: "monthly",
  coverageStatus: "Active",
  startDate: new Date().toISOString(),
  nextPaymentDate: new Date().toISOString(),
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  coveredPerson: {
    fullName: "Preview Beneficiary",
    dateOfBirth: "1960-01-01",
    gender: "male",
    relationship: "father",
    address: "12 Marina, Lagos",
    phoneNumber: "08012345678",
  },
};

const STATES = [
  "Abia",
  "Abuja (FCT)",
  "Adamawa",
  "Akwa Ibom",
  "Anambra",
  "Bauchi",
  "Bayelsa",
  "Benue",
  "Borno",
  "Cross River",
  "Delta",
  "Ebonyi",
  "Edo",
  "Ekiti",
  "Enugu",
  "Gombe",
  "Imo",
  "Jigawa",
  "Kaduna",
  "Kano",
  "Katsina",
  "Kebbi",
  "Kogi",
  "Kwara",
  "Lagos",
  "Nasarawa",
  "Niger",
  "Ogun",
  "Ondo",
  "Osun",
  "Oyo",
  "Plateau",
  "Rivers",
  "Sokoto",
  "Taraba",
  "Yobe",
  "Zamfara",
];

function Field({
  label,
  id,
  children,
  className,
}: {
  label: string;
  id: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <Label htmlFor={id}>{label}</Label>
      {children}
    </div>
  );
}

function DocPicker({
  type,
  file,
  onChange,
}: {
  type: DocumentType;
  file?: File;
  onChange: (f?: File) => void;
}) {
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
          file
            ? "border-status-active bg-status-active-bg/40"
            : "border-link/50",
        )}
      >
        <input
          ref={ref}
          type="file"
          required={!file}
          accept="application/pdf,image/jpeg,image/png"
          onChange={pick}
          aria-label={DOC_LABEL[type]}
          className="absolute inset-0 cursor-pointer opacity-0"
        />
        <Upload className="size-4 text-link" />
        <div className="text-sm font-bold">{DOC_LABEL[type]}</div>
        <div className="max-w-full truncate text-xs text-muted-foreground">
          {file ? file.name : "JPG, PNG, or PDF — up to 10MB"}
        </div>
      </div>
      {file && (
        <Button
          type="button"
          variant="ghost"
          size="xs"
          onClick={() => {
            onChange(undefined);
            if (ref.current) ref.current.value = "";
          }}
          className="inline-flex items-center gap-1 self-start text-xs font-semibold text-link h-auto p-0 hover:bg-transparent"
        >
          <X className="size-3" /> Remove
        </Button>
      )}
      {error && (
        <p role="alert" className="text-xs text-status-cancelled">
          {error}
        </p>
      )}
    </div>
  );
}

export function RequestServiceView() {
  const plansQ = usePlans();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { plan: paramPlan } = useSearch({ from: "/app/service-requests/new" });
  const [files, setFiles] = useState<Partial<Record<DocumentType, File>>>({});
  const [progress, setProgress] = useState<string | null>(null);
  // If the request is created but an upload fails, a retry skips creation and uploads what's left.
  const created = useRef<{ id: string; done: Set<DocumentType> } | null>(null);

  const eligible = (plansQ.data ?? []).filter((p) =>
    ELIGIBLE_PLAN.has(p.status),
  );
  const [planId, setPlanId] = useState(paramPlan ?? "");
  const [dod, setDod] = useState<Date | null>(null);
  const [serviceDate, setServiceDate] = useState<Date | null>(null);
  const [selectedState, setSelectedState] = useState<string>("Lagos");
  const plan =
    eligible.find((p) => p._id === planId) ??
    eligible[0] ??
    (BYPASS_PLAN_REQUIREMENT ? PREVIEW_FALLBACK_PLAN : undefined);

  const submit = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (!created.current) {
        const req = await createServiceRequest(body);
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
    const day = (k: string) => {
      const v = text(k);
      if (!v) return undefined;
      const parsed = new Date(`${v}T00:00:00.000Z`);
      return Number.isNaN(parsed.getTime()) ? undefined : parsed.toISOString();
    };
    const extra = text("info");
    const location = `${text("venue")}, ${text("state")}`;
    const serviceDate = day("service");
    submit.mutate({
      planId: plan._id,
      dateOfDeath: day("dod"),
      serviceLocation: location,
      burialLocation: location,
      expectedServiceDate: serviceDate,
      expectedBurialDate: serviceDate,
      contactPerson: text("contact"),
      contactPhone: text("phone"),
      ...(extra && { additionalInformation: extra }),
    });
  }

  const _today = new Date().toISOString().slice(0, 10);
  const partial = !!created.current && submit.isError;

  return (
    <main className="flex max-w-[660px] flex-col gap-6 p-5 md:p-10">
      <header className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">
          <Link to="/app/service-requests" className="hover:underline">
            Service requests
          </Link>{" "}
          / New request
        </div>
        <h1 className="font-serif text-[52px] font-normal leading-[1.05]">
          Request the <span className="italic">service</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          We&rsquo;ll verify your documents and review your request.
          You&rsquo;ll be notified at every step.
        </p>
      </header>

      {plansQ.isPending && <RequestServiceSkeleton />}
      {plansQ.isSuccess &&
        eligible.length === 0 &&
        !BYPASS_PLAN_REQUIREMENT && (
          <div className="rounded-2xl bg-white p-6 text-sm leading-relaxed text-ink-soft">
            <div className="mb-1 font-serif text-2xl text-foreground">
              No plan is ready for a service
            </div>
            A service can be requested for a plan once it&rsquo;s active.{" "}
            <Link to="/app/plans" className="font-bold text-link underline">
              Go to my plans
            </Link>
          </div>
        )}

      {BYPASS_PLAN_REQUIREMENT && eligible.length === 0 && (
        <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900">
          <strong>Preview mode:</strong> Showing request service flow with a
          mock plan.
        </div>
      )}

      {plan && (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <section className="flex flex-col gap-5 rounded-[28px] bg-white p-7">
            <Field label="Which plan is this for?" id="plan">
              <Select
                value={plan._id}
                onValueChange={(val) => {
                  if (val) setPlanId(val);
                }}
                disabled={
                  partial || (BYPASS_PLAN_REQUIREMENT && eligible.length === 0)
                }
              >
                <SelectTrigger id="plan">
                  <SelectValue placeholder="Choose a plan" />
                </SelectTrigger>
                <SelectContent>
                  {eligible.length > 0 ? (
                    eligible.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {p.coveredPerson.fullName} — {p.packageDetails.name} ·{" "}
                        {formatMoney(p.totalContributedAmount, p.currency)}{" "}
                        saved
                      </SelectItem>
                    ))
                  ) : (
                    <SelectItem value={PREVIEW_FALLBACK_PLAN._id}>
                      Preview Plan (Bypassed plan requirement)
                    </SelectItem>
                  )}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Date of death" id="dod">
                <DatePicker
                  id="dod"
                  value={dod}
                  onChange={setDod}
                  placeholder="Select date of death"
                  maxDate={new Date()}
                />
                <input
                  type="hidden"
                  name="dod"
                  value={
                    dod
                      ? `${dod.getFullYear()}-${String(dod.getMonth() + 1).padStart(2, "0")}-${String(dod.getDate()).padStart(2, "0")}`
                      : ""
                  }
                  required
                />
              </Field>
              <Field label="Expected date of service" id="service">
                <DatePicker
                  id="service"
                  value={serviceDate}
                  onChange={setServiceDate}
                  placeholder="Select date of service"
                  minDate={new Date()}
                />
                <input
                  type="hidden"
                  name="service"
                  value={
                    serviceDate
                      ? `${serviceDate.getFullYear()}-${String(serviceDate.getMonth() + 1).padStart(2, "0")}-${String(serviceDate.getDate()).padStart(2, "0")}`
                      : ""
                  }
                  required
                />
              </Field>
              <Field label="State" id="state">
                <Select
                  value={selectedState}
                  onValueChange={(val) => {
                    if (val) setSelectedState(val);
                  }}
                  name="state"
                >
                  <SelectTrigger id="state">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {STATES.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <input type="hidden" name="state" value={selectedState} />
              </Field>
              <Field label="Venue / burial location" id="venue">
                <Input
                  id="venue"
                  name="venue"
                  required
                  minLength={3}
                  placeholder="e.g. St. Peter's Church, Ikeja"
                />
              </Field>
            </div>
            <hr className="border-border" />
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Contact person on the day
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Full name" id="contact">
                <Input
                  id="contact"
                  name="contact"
                  required
                  minLength={2}
                  placeholder="e.g. Chidi Okafor"
                />
              </Field>
              <Field label="Phone number" id="phone">
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  required
                  minLength={5}
                  placeholder="e.g. 0803 123 4567"
                />
              </Field>
            </div>
            <Field label="Anything we should know? (optional)" id="info">
              <textarea
                id="info"
                name="info"
                rows={3}
                placeholder="Scale of the event, number of guests, special requests…"
                className="w-full rounded-xl border border-border bg-background p-3.5 text-sm placeholder:text-foreground/40 focus-visible:outline-2 focus-visible:outline-accent"
              />
            </Field>
            <hr className="border-border" />
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Supporting documents
              </span>
              <div className="grid gap-4 sm:grid-cols-2">
                {REQUIRED_DOCS.map((type) => (
                  <DocPicker
                    key={type}
                    type={type}
                    file={files[type]}
                    onChange={(f) => setFiles((s) => ({ ...s, [type]: f }))}
                  />
                ))}
              </div>
            </div>
          </section>

          <div className="flex items-start gap-3 rounded-2xl bg-cream px-5 py-4 text-[13px] leading-relaxed text-status-due">
            <Info className="mt-0.5 size-4 shrink-0" />
            <div>
              Submitting this request moves {plan.coveredPerson.fullName}
              &rsquo;s plan into service review.
            </div>
          </div>

          {submit.isError && (
            <p
              role="alert"
              className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
            >
              {partial
                ? "Your request was submitted, but a document didn’t upload. "
                : ""}
              {submit.error.message}
              {partial ? " Press the button to retry the upload." : ""}
            </p>
          )}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="h-[54px] rounded-xl"
              onClick={() => navigate({ to: "/app/service-requests" })}
              disabled={submit.isPending}
            >
              {partial ? "Skip for now" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="h-[54px] flex-1 rounded-xl"
              disabled={submit.isPending}
            >
              {submit.isPending
                ? (progress ?? "Submitting…")
                : partial
                  ? "Retry upload"
                  : "Submit request"}
            </Button>
          </div>
        </form>
      )}
    </main>
  );
}
export default RequestServiceView;
