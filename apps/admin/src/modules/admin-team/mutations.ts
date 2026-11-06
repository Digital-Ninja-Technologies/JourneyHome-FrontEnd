import type { CreateAdminInput } from "@journeyhome/schemas";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createAdmin, deleteAdmin } from "./api";
import { adminsQueryOptions } from "./query-options";

export function useCreateAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreateAdminInput) => createAdmin(body),
    onSuccess: (admin) => {
      void queryClient.invalidateQueries({
        queryKey: adminsQueryOptions().queryKey,
      });
      toast.add({
        type: "success",
        title: "Admin added",
        description: `${admin.name} can now sign in with the temporary password.`,
      });
    },
    onError: (error: Error) =>
      toast.add({
        type: "error",
        title: "Couldn't add the admin",
        description: error.message,
      }),
  });
}

export function useDeleteAdminMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteAdmin(id),
    onSuccess: (res) => {
      void queryClient.invalidateQueries({
        queryKey: adminsQueryOptions().queryKey,
      });
      toast.add({
        type: "info",
        title: "Admin removed",
        description: res.email,
      });
    },
    onError: (error: Error) =>
      toast.add({
        type: "error",
        title: "Couldn't remove the admin",
        description: error.message,
      }),
  });
}
