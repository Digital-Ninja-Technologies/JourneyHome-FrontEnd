import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { AdminLoginInput } from "@journeyhome/schemas";
import { adminLogin, adminLogout } from "./api";
import { adminSessionQueryOptions } from "./query-options";

export function useAdminLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: AdminLoginInput & { redirect?: string }) =>
      adminLogin(input),
    onSuccess: (session, variables) => {
      queryClient.setQueryData(adminSessionQueryOptions().queryKey, session);
      const to = variables.redirect || "/";
      navigate({ to: to as any, replace: true });
    },
  });
}

export function useAdminLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await adminLogout();
    },
    onSuccess: () => {
      queryClient.setQueryData(adminSessionQueryOptions().queryKey, null);
      queryClient.clear();
      navigate({ to: "/login", replace: true });
    },
  });
}
