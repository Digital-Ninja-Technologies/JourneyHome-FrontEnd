import { zodResolver } from "@hookform/resolvers/zod";
import type { Plan, PlanStatus } from "@journeyhome/schemas";
import { Button } from "@journeyhome/ui/components/button";
import { FormSelect } from "@journeyhome/ui/components/form-fields";
import { LoaderCircleIcon } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SectionCard } from "@/components/section-card";
import { PLAN_STATUS } from "@/components/status-pill";
import { useUpdatePlanStatusMutation } from "../mutations";
import { transitionOptions } from "../plans.utils";

const schema = z.object({
  status: z.string().min(1, "Choose the new status"),
});
type Values = z.infer<typeof schema>;

export function PlanStatusCard({ plan }: { plan: Plan }) {
  const options = transitionOptions(plan.status);
  const update = useUpdatePlanStatusMutation(plan._id);
  const [label] = PLAN_STATUS[plan.status];

  const { control, handleSubmit, reset } = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: { status: "" },
  });

  return (
    <SectionCard
      tone="dark"
      title="Status"
      description={
        options.length === 0
          ? `This plan is ${label.toLowerCase()} and can't change status any further.`
          : `Currently ${label.toLowerCase()}. Only the moves the backend allows are listed.`
      }
    >
      {options.length > 0 && (
        <form
          noValidate
          onSubmit={handleSubmit((v) =>
            update.mutate(v.status as PlanStatus, {
              onSuccess: () => reset({ status: "" }),
            }),
          )}
          className="flex flex-col gap-3 [&_[data-slot=field-label]]:text-xs [&_[data-slot=field-label]]:uppercase [&_[data-slot=field-label]]:tracking-[2px] [&_[data-slot=field-label]]:text-canvas/70"
        >
          <FormSelect
            control={control}
            name="status"
            label="Move to"
            placeholder="Choose a status"
            options={options}
            className="border-canvas/15 bg-sidebar text-canvas data-placeholder:text-canvas/60"
          />
          <Button
            type="submit"
            variant="accent"
            size="lg"
            disabled={update.isPending}
            className="h-12 rounded-xl"
          >
            {update.isPending ? (
              <>
                <LoaderCircleIcon className="animate-spin" />
                Saving…
              </>
            ) : (
              "Save status"
            )}
          </Button>
        </form>
      )}
    </SectionCard>
  );
}
