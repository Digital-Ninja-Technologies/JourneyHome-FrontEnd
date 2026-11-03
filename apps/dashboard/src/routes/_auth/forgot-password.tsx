import { createFileRoute, redirect } from "@tanstack/react-router";
import { ForgotPasswordForm, sessionQueryOptions } from "@/modules/auth";

export const Route = createFileRoute("/_auth/forgot-password")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(
      sessionQueryOptions(),
    );
    if (session?.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ForgotPasswordForm,
});
