import { zodResolver } from "@hookform/resolvers/zod";
import type { DocumentType, Plan } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { FieldGroup } from "@journeyhome/ui/components/field";
import { FormSelect } from "@journeyhome/ui/components/form-fields";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { Info } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { RequestServiceSkeleton } from "@/components/skeletons";
import { formatMoney } from "@/lib/format";
import { usePlans } from "@/modules/plans/query-options";
import {
  createServiceRequest,
  serviceDocumentUpload,
} from "@/modules/service-requests/api";
import {
  documentsToUpload,
  type ServiceRequestFormValues,
  serviceRequestDefaults,
  serviceRequestSchema,
  toCreateServiceRequestBody,
} from "@/modules/service-requests/service-request-form";
import { ELIGIBLE_PLAN } from "@/modules/service-requests/service-requests.utils";
import { useFileUpload } from "@/modules/storage/hooks/use-file-upload";
import { FormDocumentUploads } from "./form-document-uploads";
import {
  AdditionalInfoField,
  ContactPersonFields,
  ServiceDetailsFields,
} from "./service-details-fields";

const planLabel = (p: Plan) =>
  `${p.coveredPerson.fullName} — ${p.packageDetails.name} plan`;

const SECTION_TITLE =
  "text-xs font-bold uppercase tracking-wider text-muted-foreground";

export function RequestServiceView() {
  const plansQ = usePlans();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { plan: paramPlan } = useSearch({ from: "/app/service-requests/new" });
  const { uploadFile, isUploading, progress } = useFileUpload();

  const [uploadingType, setUploadingType] = useState<DocumentType | null>(null);
  const [uploaded, setUploaded] = useState<DocumentType[]>([]);
  // If the request is created but an upload fails, a retry skips creation and uploads what's left.
  const created = useRef<{ id: string; done: Set<DocumentType> } | null>(null);

  const form = useForm<ServiceRequestFormValues>({
    resolver: zodResolver(serviceRequestSchema),
    defaultValues: serviceRequestDefaults(paramPlan ?? ""),
  });
  const { control, setValue, getValues } = form;

  const eligible = (plansQ.data ?? []).filter((p) =>
    ELIGIBLE_PLAN.has(p.status),
  );
  const planId = useWatch({ control, name: "planId" });
  const plan = eligible.find((p) => p._id === planId);

  // Plans load async: once they do, fall back to the first eligible one if the
  // preselected plan (from the URL) isn't eligible or none was given.
  const firstEligibleId = eligible[0]?._id;
  useEffect(() => {
    if (firstEligibleId && !eligible.some((p) => p._id === getValues("planId")))
      setValue("planId", firstEligibleId);
  }, [firstEligibleId, eligible, getValues, setValue]);

  const submit = useMutation({
    mutationFn: async (values: ServiceRequestFormValues) => {
      if (!created.current) {
        const req = await createServiceRequest(
          toCreateServiceRequestBody(values),
        );
        created.current = { id: req._id, done: new Set() };
      }
      const { id, done } = created.current;
      for (const [type, file] of documentsToUpload(values.documents)) {
        if (done.has(type)) continue;
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

  const partial = !!created.current && submit.isError;
  const locked = submit.isPending || partial;
  const toUpload = documentsToUpload(form.getValues("documents"));
  const uploadIndex = uploadingType
    ? toUpload.findIndex(([type]) => type === uploadingType) + 1
    : 0;

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
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => submit.mutate(values))}
          className="flex flex-col gap-6"
        >
          <section className="flex flex-col gap-5 rounded-[28px] bg-white p-7">
            <fieldset
              disabled={locked}
              className="m-0 flex min-w-0 flex-col gap-5 border-0 p-0"
            >
              <FormSelect
                control={control}
                name="planId"
                label="Which plan is this for?"
                placeholder="Choose a plan"
                options={eligible.map((p) => ({
                  value: p._id,
                  label: `${planLabel(p)} · ${formatMoney(p.totalContributedAmount, p.currency)} saved`,
                }))}
              />
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <ServiceDetailsFields control={control} />
              </FieldGroup>
              <hr className="border-border" />
              <div className={SECTION_TITLE}>Contact person on the day</div>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <ContactPersonFields control={control} />
              </FieldGroup>
              <AdditionalInfoField control={control} />
            </fieldset>

            <hr className="border-border" />
            <div className="flex flex-col gap-3">
              <span className={SECTION_TITLE}>Supporting documents</span>
              <FormDocumentUploads
                control={control}
                uploaded={uploaded}
                uploadingType={isUploading ? uploadingType : null}
                progress={progress}
                disabled={submit.isPending}
              />
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
