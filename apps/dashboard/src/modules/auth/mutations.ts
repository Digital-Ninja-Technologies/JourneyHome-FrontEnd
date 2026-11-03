import type { LoginInput, SignupInput } from "@journeyhome/schemas";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import {
  deleteAccount,
  login,
  logout,
  resendVerification,
  signup,
  type User,
  updateUserLocally,
  verifyEmail,
} from "./api";
import { sessionQueryOptions } from "./query-options";

export function useLoginMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (
      input: LoginInput & { remember?: boolean; redirect?: string },
    ) => login(input),
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
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: SignupInput) => signup(input),
    onSuccess: () => {
      navigate({
        to: "/signup/verify",
        replace: true,
      });
    },
  });
}

export function useVerifyEmailMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (token: string) => verifyEmail(token),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: sessionQueryOptions().queryKey,
      });
      navigate({
        to: "/login",
        replace: true,
      });
    },
  });
}

export function useResendVerificationMutation() {
  return useMutation({
    mutationFn: (email: string) => resendVerification(email),
  });
}

export function useDeleteAccountMutation() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (password: string) => deleteAccount(password),
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryOptions().queryKey, null);
      queryClient.clear();
      navigate({ to: "/login", replace: true });
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
