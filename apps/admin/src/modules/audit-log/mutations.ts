import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteAuditLog } from "./api";

export function useDeleteAuditLogMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAuditLog(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["audit-log"] });
      toast.add({ type: "success", title: "Audit entry deleted" });
    },
    onError: (error: Error) =>
      toast.add({
        type: "error",
        title: "Couldn't delete the audit entry",
        description: error.message,
      }),
  });
}
