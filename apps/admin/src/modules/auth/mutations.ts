import type { AdminLoginInput } from "@journeyhome/schemas";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { redirectTarget } from "@/lib/search-schemas";
import { login, logout } from "./api";
import { sessionQueryOptions } from "./query-options";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: AdminLoginInput & { redirect?: string }) =>
      login(input),
    onSuccess: (session, variables) => {
      queryClient.clear();
      queryClient.setQueryData(sessionQueryOptions().queryKey, session);
      toast.add({
        type: "success",
        title: "Welcome back",
        description: `Signed in as ${session.user.name || session.user.email}.`,
      });
      navigate({ href: redirectTarget(variables.redirect), replace: true });
    },
    onError: (error: Error) => {
      toast.add({
        type: "error",
        title: "Sign in failed",
        description: error.message || "Invalid email or password.",
      });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: () => logout(),
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryOptions().queryKey, null);
      queryClient.clear();
      toast.add({ type: "info", title: "Signed out" });
      navigate({ to: "/login", replace: true });
    },
  });
}
