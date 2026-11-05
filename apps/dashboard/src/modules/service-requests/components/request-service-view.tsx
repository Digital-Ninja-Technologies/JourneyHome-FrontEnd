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
import { toast } from "@journeyhome/ui/components/toast";
import { cn } from "@journeyhome/ui/lib/utils";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useRef, useState } from "react";
import { RequestServiceSkeleton } from "@/components/skeletons";
import { formatMoney } from "@/lib/format";
import { usePlans } from "@/modules/plans/query-options";
import {
  createServiceRequest,
  serviceDocumentUpload,
} from "@/modules/service-requests/api";
import {
  DOC_ACCEPT,
  DOC_HINT,
  DOC_LABEL,
  DOC_MAX_BYTES,
  ELIGIBLE_PLAN,
  REQUIRED_DOCS,
} from "@/modules/service-requests/service-requests.utils";
import { FileUploadArea } from "@/modules/storage/components/file-upload-area";
import { useFileUpload } from "@/modules/storage/hooks/use-file-upload";

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

/** A calendar day picked in the UI, as the API's UTC-midnight ISO timestamp. */
function toIsoDay(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}T00:00:00.000Z`;
}

const planLabel = (p: Plan) =>
  `${p.coveredPerson.fullName} — ${p.packageDetails.name} plan`;

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

export function RequestServiceView() {
  const plansQ = usePlans();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { plan: paramPlan } = useSearch({ from: "/app/service-requests/new" });
  const { uploadFile, isUploading, progress } = useFileUpload();

  const [files, setFiles] = useState<Partial<Record<DocumentType, File>>>({});
  const [docErrors, setDocErrors] = useState<
    Partial<Record<DocumentType, string>>
  >({});
  const [formError, setFormError] = useState<string | null>(null);
  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [uploaded, setUploaded] = useState<DocumentType[]>([]);
  // If the request is created but an upload fails, a retry skips creation and uploads what's left.
  const created = useRef<{ id: string; done: Set<DocumentType> } | null>(null);

  const eligible = (plansQ.data ?? []).filter((p) =>
    ELIGIBLE_PLAN.has(p.status),
  );
  const [planId, setPlanId] = useState(paramPlan ?? "");
  const [dod, setDod] = useState<Date | null>(null);
  const [serviceDate, setServiceDate] = useState<Date | null>(null);
  const [selectedState, setSelectedState] = useState<string>("Lagos");
  const plan = eligible.find((p) => p._id === planId) ?? eligible[0];

  const toUpload = REQUIRED_DOCS.filter((t) => files[t]);

  const submit = useMutation({
    mutationFn: async (body: Record<string, unknown>) => {
      if (!created.current) {
        const req = await createServiceRequest(body);
        created.current = { id: req._id, done: new Set() };
      }
      const { id, done } = created.current;
      for (const type of toUpload) {
        const file = files[type];
        if (!file || done.has(type)) continue;
        setUploadingType(type);
        await uploadFile(file, serviceDocumentUpload(id, type));
        done.add(type);
        setUploaded([...done]);
      }
      return id;
    },
    onSuccess: (id) => {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      void queryClient.invalidateQueries({ queryKey: ["plan"] });
      void queryClient.invalidateQueries({ queryKey: ["service-requests"] });
      toast.add({
        type: "success",
        title: "Service request submitted",
        description:
          "Our care team will review your details and contact you shortly.",
      });
      navigate({ to: "/app/service-requests/$id", params: { id } });
    },
    onError: (error: Error) => {
      // Once the request exists, a failed upload has already been toasted by the upload hook.
      if (created.current) return;
      toast.add({
        type: "error",
        title: "Submission failed",
        description: error.message || "Could not submit service request.",
      });
    },
    onSettled: () => setUploadingType(null),
  });

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!plan) return;

    const missing = REQUIRED_DOCS.filter((t) => !files[t]);
    setDocErrors(
      Object.fromEntries(
        missing.map((t) => [
          t,
          `Please upload the ${DOC_LABEL[t].toLowerCase()}.`,
        ]),
      ),
    );
    if (!dod || !serviceDate) {
      setFormError(
        "Please choose the date of death and the expected service date.",
      );
      return;
    }
    setFormError(null);
    if (missing.length > 0) return;

    const d = new FormData(e.currentTarget);
    const text = (k: string) => String(d.get(k) ?? "").trim();
    const extra = text("info");
    submit.mutate({
      planId: plan._id,
      dateOfDeath: toIsoDay(dod),
      serviceLocation: `${text("venue")}, ${selectedState}`,
      expectedServiceDate: toIsoDay(serviceDate),
      contactPerson: text("contact"),
      contactPhone: text("phone"),
      ...(extra && { additionalInformation: extra }),
    });
  }

  const partial = !!created.current && submit.isError;
  const locked = submit.isPending || partial;
  const uploadIndex = uploadingType ? toUpload.indexOf(uploadingType) + 1 : 0;

  return (
    <main className="flex max-w-2xl flex-1 flex-col gap-6">
      <header className="flex flex-col gap-2">
        <div className="text-sm text-muted-foreground">
          <Link to="/app" className="hover:underline">
            Dashboard
          </Link>{" "}
          /{" "}
          <Link to="/app/service-requests" className="hover:underline">
            Service requests
          </Link>{" "}
          / New request
        </div>
        <h1 className="page-title">
          Request the <span className="italic">service</span>
        </h1>
        <p className="text-sm text-muted-foreground">
          We&rsquo;ll verify your documents and review your request.
          You&rsquo;ll be notified at every step.
        </p>
      </header>

      {plansQ.isPending && <RequestServiceSkeleton />}

      {plansQ.isError && (
        <div className="flex flex-col items-start gap-3 rounded-2xl bg-white p-6 text-sm text-ink-soft">
          <span>Couldn&rsquo;t load your plans. {plansQ.error.message}</span>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => void plansQ.refetch()}
          >
            Try again
          </Button>
        </div>
      )}

      {plansQ.isSuccess && eligible.length === 0 && (
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

      {plan && (
        <form onSubmit={onSubmit} className="flex flex-col gap-6">
          <section className="flex flex-col gap-5 rounded-[28px] bg-white p-7">
            <fieldset
              disabled={locked}
              className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0"
            >
              <Field label="Which plan is this for?" id="plan">
                <Select
                  value={plan._id}
                  onValueChange={(val) => {
                    if (val) setPlanId(val);
                  }}
                >
                  <SelectTrigger id="plan">
                    <SelectValue placeholder="Choose a plan">
                      {(v: string | null) => {
                        const p = eligible.find((e) => e._id === v);
                        return p ? planLabel(p) : "Choose a plan";
                      }}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    {eligible.map((p) => (
                      <SelectItem key={p._id} value={p._id}>
                        {planLabel(p)} ·{" "}
                        {formatMoney(p.totalContributedAmount, p.currency)}{" "}
                        saved
                      </SelectItem>
                    ))}
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
                </Field>
                <Field label="Expected date of service" id="service">
                  <DatePicker
                    id="service"
                    value={serviceDate}
                    onChange={setServiceDate}
                    placeholder="Select date of service"
                    minDate={new Date()}
                  />
                </Field>
                <Field label="State" id="state">
                  <Select
                    value={selectedState}
                    onValueChange={(val) => {
                      if (val) setSelectedState(val);
                    }}
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
            </fieldset>

            <hr className="border-border" />
            <div className="flex flex-col gap-3">
              <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Supporting documents
              </span>
              <div className="grid gap-4 sm:grid-cols-2">
                {REQUIRED_DOCS.map((type) => (
                  <FileUploadArea
                    key={type}
                    label={DOC_LABEL[type]}
                    accept={DOC_ACCEPT}
                    maxSize={DOC_MAX_BYTES}
                    hint={DOC_HINT}
                    value={files[type]}
                    error={docErrors[type]}
                    uploaded={uploaded.includes(type)}
                    isUploading={isUploading && uploadingType === type}
                    progress={progress}
                    disabled={submit.isPending}
                    onChange={(file) => {
                      setDocErrors((s) => ({ ...s, [type]: undefined }));
                      setFiles((s) => ({ ...s, [type]: file ?? undefined }));
                    }}
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

          {formError && (
            <p
              role="alert"
              className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
            >
              {formError}
            </p>
          )}
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
              onClick={() =>
                partial && created.current
                  ? navigate({
                      to: "/app/service-requests/$id",
                      params: { id: created.current.id },
                    })
                  : navigate({ to: "/app/service-requests" })
              }
              disabled={submit.isPending}
            >
              {partial ? "Finish later" : "Cancel"}
            </Button>
            <Button
              type="submit"
              variant="accent"
              size="lg"
              className="h-[54px] flex-1 rounded-xl"
              disabled={submit.isPending}
            >
              {isUploading
                ? `Uploading ${uploadIndex}/${toUpload.length} (${progress}%)`
                : submit.isPending
                  ? "Submitting…"
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
