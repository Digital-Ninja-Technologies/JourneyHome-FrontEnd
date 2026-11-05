import { Button } from "@journeyhome/ui/components/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { useEffect, useState } from "react";
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
import {
  CoveredPersonFields,
  PackagePicker,
  planRequestBody,
} from "@/modules/plans/components/plan-form-parts";
import { MARKETING_URL } from "@/modules/plans/plans.utils";

export function OnboardingPlanView() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const search = useSearch({ from: "/signup/plan" });
  const packagesQ = usePackages();
  const [packageId, setPackageId] = useState("");
  const selected = packagesQ.data?.find((p) => p._id === packageId);

  const wanted =
    resolveSelectedPackage(search) ?? getStoredSelectedPackage() ?? undefined;

  // Pre-select the package chosen on the marketing site (URL first, then session backup),
  // once the list has loaded and only if it's still an available package.
  useEffect(() => {
    if (packageId || !packagesQ.data || packagesQ.data.length === 0) return;
    if (wanted && packagesQ.data.some((p) => p._id === wanted)) {
      setPackageId(wanted);
    } else {
      setPackageId(packagesQ.data[0]._id);
    }
  }, [packagesQ.data, packageId, wanted]);

  function choosePackage(id: string) {
    setPackageId(id);
    setStoredSelectedPackage(id);
  }

  const [formError, setFormError] = useState("");

  const create = useMutation({
    mutationFn: (body: unknown) => createPlan(body),
    onSuccess: (plan) => {
      clearStoredSelectedPackage();
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      navigate({ to: "/signup/payment", search: { plan: plan._id } });
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
          onSubmit={(e) => {
            e.preventDefault();
            setFormError("");
            if (selected) {
              const body = planRequestBody(e.currentTarget, selected._id);
              if (!body.coveredPerson.dateOfBirth) {
                setFormError(
                  "Please select a date of birth for the covered person.",
                );
                return;
              }
              create.mutate(body);
            }
          }}
          className="flex flex-col gap-6"
        >
          <section className="flex flex-col gap-6 rounded-[28px] bg-white p-7 shadow-sm">
            <CoveredPersonFields />
            <hr className="border-border" />
            <PackagePicker value={packageId} onChange={choosePackage} />
            <a
              href={`${MARKETING_URL}/pricing`}
              className="self-start text-xs font-semibold underline"
            >
              Compare full package details
            </a>
          </section>
          {(formError || create.isError) && (
            <p
              role="alert"
              className="rounded-lg bg-status-cancelled-bg px-3 py-2 text-[13px] text-status-cancelled"
            >
              {formError || create.error?.message}
            </p>
          )}
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
