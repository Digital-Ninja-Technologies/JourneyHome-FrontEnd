import type { PlanStatus } from "@journeyhome/schemas";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { PLAN_STATUS } from "@/components/status-pill";
import { updatePlanStatus } from "./api";

export function useUpdatePlanStatusMutation(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: PlanStatus) => updatePlanStatus(id, status),
    onSuccess: (plan) => {
      void queryClient.invalidateQueries({ queryKey: ["plans"] });
      void queryClient.invalidateQueries({ queryKey: ["overview"] });
      toast.add({
        type: "success",
        title: "Plan updated",
        description: `Status changed to ${PLAN_STATUS[plan.status][0].toLowerCase()}.`,
      });
    },
    onError: (error: Error) => {
      toast.add({
        type: "error",
        title: "Couldn't update the plan",
        description: error.message,
      });
    },
  });
}
