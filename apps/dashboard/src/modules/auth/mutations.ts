import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import type { LoginInput, SignupInput } from "@journeyhome/schemas";
import {
  login,
  logout,
  signup,
  updateUserLocally,
  type User,
} from "./api";
import { sessionQueryOptions } from "./query-options";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: LoginInput & { remember?: boolean; redirect?: string }) =>
      login(input),
    onSuccess: (session, variables) => {
      queryClient.setQueryData(sessionQueryOptions().queryKey, session);
      const to = variables.redirect || "/app";
      navigate({ to: to as any, replace: true });
    },
  });
}

export function useLogoutMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryOptions().queryKey, null);
      queryClient.clear();
      navigate({ to: "/login", replace: true });
    },
  });
}

export function useSignupMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: SignupInput & { phone?: string }) => signup(input),
    onSuccess: (session) => {
      queryClient.setQueryData(sessionQueryOptions().queryKey, session);
      navigate({ to: "/signup/verify", replace: true });
    },
  });
}

export function useUpdateUserMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (patch: Partial<Pick<User, "name" | "email">>) => {
      return updateUserLocally(patch);
    },
    onSuccess: (updatedSession) => {
      queryClient.setQueryData(sessionQueryOptions().queryKey, updatedSession);
    },
  });
}
