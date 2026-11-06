import type { LoginInput, SignupInput } from "@journeyhome/schemas";
import { toast } from "@journeyhome/ui/components/toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "@tanstack/react-router";
import { sanitizeRedirect } from "@/lib/search-schemas";
import {
  deleteAccount,
  login,
  logout,
  signup,
  type User,
  updateUserLocally,
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
      queryClient.clear();
      queryClient.setQueryData(sessionQueryOptions().queryKey, session);
      toast.add({
        type: "success",
        title: "Welcome back",
        description: `Signed in as ${session.user.name || session.user.email}.`,
      });
      const to = sanitizeRedirect(variables.redirect, "/app");
      navigate({ to: to as any, replace: true });
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
    mutationFn: async () => {
      await logout();
    },
    onSuccess: () => {
      queryClient.setQueryData(sessionQueryOptions().queryKey, null);
      queryClient.clear();
      toast.add({
        type: "info",
        title: "Signed out",
        description: "You have been logged out of your account.",
      });
      navigate({ to: "/login", replace: true });
    },
    onError: (error: Error) => {
      toast.add({
        type: "error",
        title: "Logout failed",
        description: error.message || "Could not log out at this time.",
      });
    },
  });
}

export function useSignupMutation() {
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (input: SignupInput) => signup(input),
    onSuccess: () => {
      toast.add({
        type: "success",
        title: "Account created",
        description: "Please check your email to verify your account.",
      });
      navigate({
        to: "/verify-email",
        replace: true,
      });
    },
    onError: (error: Error) => {
      toast.add({
        type: "error",
        title: "Sign up failed",
        description: error.message || "Could not create account.",
      });
    },
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
      toast.add({
        type: "info",
        title: "Account deleted",
        description: "Your account and data have been removed.",
      });
      navigate({ to: "/login", replace: true });
    },
    onError: (error: Error) => {
      toast.add({
        type: "error",
        title: "Delete account failed",
        description: error.message || "Incorrect password or server error.",
      });
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
      toast.add({
        type: "success",
        title: "Profile updated",
        description: "Your personal details have been updated.",
      });
    },
    onError: (error: Error) => {
      toast.add({
        type: "error",
        title: "Update failed",
        description: error.message || "Failed to update profile.",
      });
    },
  });
}
