import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteNotification, markNotificationRead } from "./api";

export function useMarkNotificationReadMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (ids: string[]) => Promise.all(ids.map(markNotificationRead)),
    onSettled: () =>
      queryClient.invalidateQueries({ queryKey: ["notifications"] }),
    onError: (error: Error) =>
      toast.add({
        type: "error",
        title: "Couldn't mark as read",
        description: error.message,
      }),
  });
}

export function useDeleteNotificationMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteNotification(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.add({ type: "success", title: "Notification removed" });
    },
    onError: (error: Error) =>
      toast.add({
        type: "error",
        title: "Couldn't remove the notification",
        description: error.message,
      }),
  });
}
