import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@journeyhome/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@journeyhome/ui/components/dialog";
import { FieldGroup } from "@journeyhome/ui/components/field";
import { toast } from "@journeyhome/ui/components/toast";
import { useIsMobile } from "@journeyhome/ui/hooks/use-mobile";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { LoaderCircleIcon } from "lucide-react";
import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { formatMoney } from "@/lib/format";
import { usePackages } from "@/modules/packages/query-options";
import { createPlan } from "@/modules/plans/api";
import {
  type PlanFormValues,
  planFormDefaults,
  planFormSchema,
  toCreatePlanBody,
} from "@/modules/plans/plan-form";
import { CoveredPersonFields } from "./covered-person-fields";
import { FormPackagePicker } from "./form-package-picker";

const FORM_ID = "create-plan-form";

export function CreatePlanDialog({
  open,
  onClose,
  initialPackageId,
}: {
  open: boolean;
  onClose: () => void;
  /** Preselected when the dialog opens, if it's still an available package. */
  initialPackageId?: string;
}) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const packagesQ = usePackages();
  const isMobile = useIsMobile();

  const form = useForm<PlanFormValues>({
    resolver: zodResolver(planFormSchema),
    defaultValues: planFormDefaults,
  });
  const { control, reset, getValues, setValue } = form;

  const packageId = useWatch({ control, name: "packageId" });
  const selected = packagesQ.data?.find((p) => p._id === packageId);

  const create = useMutation({
    mutationFn: (values: PlanFormValues) =>
      createPlan(toCreatePlanBody(values)),
    onSuccess: (plan) => {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      toast.add({
        type: "success",
        title: "Plan created",
        description: "Your new coverage plan has been created.",
      });
      onClose();
      navigate({ to: "/app/plans/$id", params: { id: plan._id } });
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
  const { reset: resetMutation } = create;

  useEffect(() => {
    if (!open || !initialPackageId || getValues("packageId")) return;
    if (packagesQ.data?.some((p) => p._id === initialPackageId)) {
      setValue("packageId", initialPackageId);
    }
  }, [open, initialPackageId, packagesQ.data, getValues, setValue]);

  // Start fresh every time the dialog is reopened.
  useEffect(() => {
    if (!open) {
      reset(planFormDefaults);
      resetMutation();
    }
  }, [open, reset, resetMutation]);

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      {/*
        Header and footer stay put; only the form body scrolls, so a tall form never
        pushes the actions off-screen on phones. Wider from `lg` so the 2-column grid breathes.
      */}
      <DialogContent
        // Don't auto-focus the first field on phones: it raises the keyboard over the form.
        initialFocus={!isMobile}
        className="flex max-h-[calc(100dvh-1.5rem)] max-w-[calc(100%-1.5rem)] flex-col gap-0 overflow-hidden rounded-3xl p-0 sm:max-w-xl lg:max-w-4xl"
      >
        <DialogHeader className="shrink-0 gap-1 border-b border-border/60 px-5 py-4 pr-14 sm:px-8 sm:py-6 sm:pr-16">
          <div className="text-[11px] font-extrabold tracking-[2px] text-link uppercase sm:text-xs">
            New plan
          </div>
          <DialogTitle className="font-serif text-2xl leading-tight font-normal sm:text-4xl">
            Start a new <span className="italic">plan</span>
          </DialogTitle>
          <DialogDescription className="text-xs sm:text-sm">
            You&rsquo;ll make the first contribution on the next step.
          </DialogDescription>
        </DialogHeader>

        <form
          id={FORM_ID}
          noValidate
          onSubmit={form.handleSubmit((values) => create.mutate(values))}
          className="flex min-h-0 flex-1 flex-col gap-6 overflow-y-auto overscroll-contain px-5 py-5 sm:px-8 sm:py-6"
        >
          <section className="flex flex-col gap-4">
            <h3 className="text-sm font-bold sm:text-base">
              Who is this plan for?
            </h3>
            <FieldGroup className="grid gap-4 lg:grid-cols-2 lg:gap-x-6 lg:gap-y-5">
              <CoveredPersonFields
                control={control}
                addressClassName="lg:col-span-2"
              />
            </FieldGroup>
          </section>

          <hr className="border-border" />

          <FormPackagePicker control={control} />
          <p className="-mt-3 text-xs text-muted-foreground">
            The package is fixed for the life of a plan and can&rsquo;t be
            changed once started.
          </p>
        </form>

        <div className="flex shrink-0 flex-col gap-3 border-t border-border/60 bg-popover px-5 py-3 sm:px-8 sm:py-4">
          <DialogFooter className="flex-row items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              size="lg"
              disabled={create.isPending}
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              form={FORM_ID}
              variant="accent"
              size="lg"
              disabled={!selected || create.isPending}
              className="min-w-0 flex-1 sm:flex-none"
            >
              {create.isPending ? (
                <>
                  <LoaderCircleIcon className="animate-spin" />
                  Creating…
                </>
              ) : selected ? (
                `Create plan — ${formatMoney(selected.amount, selected.currency)}/mo`
              ) : (
                "Create plan"
              )}
            </Button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
