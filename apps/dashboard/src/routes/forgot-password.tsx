import { createFileRoute, redirect } from "@tanstack/react-router";
import ForgotPassword from "@/pages/forgot-password";

export const Route = createFileRoute("/forgot-password")({
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ForgotPassword,
});
