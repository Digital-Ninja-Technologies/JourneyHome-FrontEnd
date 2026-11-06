import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@journeyhome/ui/components/button";
import { FieldGroup } from "@journeyhome/ui/components/field";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { formatMoney } from "@/lib/format";
import { resolveSelectedPackage } from "@/lib/search-schemas";
import {
  clearStoredSelectedPackage,
  getStoredSelectedPackage,
  setStoredSelectedPackage,
} from "@/modules/onboarding/storage";
import { usePackages } from "@/modules/packages/query-options";
import { setOnboardingPlan } from "@/modules/payments/checkout";
import { createPlan } from "@/modules/plans/api";
import { CoveredPersonFields } from "@/modules/plans/components/covered-person-fields";
import { FormPackagePicker } from "@/modules/plans/components/form-package-picker";
import {
  type PlanFormValues,
  planFormDefaults,
  planFormSchema,
  toCreatePlanBody,
} from "@/modules/plans/plan-form";
import { MARKETING_URL } from "@/modules/plans/plans.utils";

export function OnboardingPlanView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/signup/plan" });
  const packagesQ = usePackages();

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: planFormDefaults,
  });
  const { control, getValues, setValue } = form;
  const packageId = useWatch({ control, name: "packageId" });
  const selected = packagesQ.data?.find((p) => p._id === packageId);

  const wanted =
    resolveSelectedPackage(search) ?? getStoredSelectedPackage() ?? undefined;

  // Pre-select the package chosen on the marketing site (URL first, then session backup),
  // once the list has loaded and only if it's still an available package.
  useEffect(() => {
    if (getValues("packageId") || !packagesQ.data?.length) return;
    const pick =
      wanted && packagesQ.data.some((p) => p._id === wanted)
        ? wanted
        : packagesQ.data[0]._id;
    setValue("packageId", pick);
  }, [packagesQ.data, wanted, getValues, setValue]);

  const create = useMutation({
    mutationFn: (values: PlanFormValues) =>
      createPlan(toCreatePlanBody(values)),
    onSuccess: (plan) => {
      clearStoredSelectedPackage();
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.add({
        type: "success",
        title: "Plan created",
        description: "Proceeding to checkout to complete your plan setup.",
      });
      navigate({ to: "/signup/payment", search: { plan: plan._id } });
    },
    onError: (error: Error) => {
      toast.add({
        type: "error",
        title: "Could not create plan",
        description:
          error.message || "Failed to create plan. Please try again.",
      });
    },
  });

  return (
    <div className="flex w-full max-w-[560px] flex-col items-center gap-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="font-sans text-4xl font-extrabold leading-[1.1] tracking-tight">
          Set up your first{" "}
          <span className="font-serif font-normal italic text-link">plan.</span>
        </h1>
        <p className="text-sm leading-relaxed text-muted-foreground">
          Who are you saving for? You can add more plans later, any time.
        </p>
        <div className="mt-2">
          <Link
            to="/app"
            onClick={() => {
              clearStoredSelectedPackage();
              setOnboardingPlan(null);
            }}
            className="text-xs font-semibold text-muted-foreground underline hover:text-foreground"
          >
            Skip for now — I&rsquo;ll set up a plan later
          </Link>
        </div>
      </div>
      <div className="flex w-full flex-col gap-6">
        <form
          noValidate
          onSubmit={form.handleSubmit((values) => create.mutate(values))}
          className="flex flex-col gap-6"
        >
          <section className="flex flex-col gap-6 rounded-[28px] bg-white p-5 shadow-sm sm:p-7">
            <div className="flex flex-col gap-4">
              <h2 className="text-base font-bold">Who is this plan for?</h2>
              <FieldGroup className="grid gap-4 sm:grid-cols-2">
                <CoveredPersonFields
                  control={control}
                  addressClassName="sm:col-span-2"
                />
              </FieldGroup>
            </div>
            <hr className="border-border" />
            <FormPackagePicker
              control={control}
              onChange={setStoredSelectedPackage}
            />
            <a
              href={`${MARKETING_URL}/pricing`}
              className="self-start text-xs font-semibold underline"
            >
              Compare full package details
            </a>
          </section>
          <Button
            type="submit"
            size="lg"
            disabled={!selected || create.isPending}
            className="h-[54px] rounded-2xl"
          >
            {create.isPending
              ? "Creating your plan…"
              : selected
                ? `Continue to payment — ${formatMoney(selected.amount, selected.currency)} →`
                : "Continue to payment →"}
          </Button>
        </form>
      </div>
    </div>
  );
}

export default OnboardingPlanView;
