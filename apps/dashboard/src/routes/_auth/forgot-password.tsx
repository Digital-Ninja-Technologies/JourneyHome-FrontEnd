import { createFileRoute, redirect } from "@tanstack/react-router";
import { ForgotPasswordForm } from "@/modules/auth/components/forgot-password-form";
import { sessionQueryOptions } from "@/modules/auth/query-options";

export const Route = createFileRoute("/_auth/forgot-password")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (session?.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ForgotPasswordForm,
});
