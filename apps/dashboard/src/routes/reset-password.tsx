import { createFileRoute, redirect } from "@tanstack/react-router";
import ResetPassword from "../pages/ResetPassword";

interface ResetPasswordSearch {
  token?: string;
}

export const Route = createFileRoute("/reset-password")({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: search.token != null ? String(search.token) : undefined,
  }),
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ResetPassword,
});
