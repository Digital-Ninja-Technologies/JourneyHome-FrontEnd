import { createFileRoute, redirect } from "@tanstack/react-router";
import { sessionQueryOptions } from "@/modules/auth";
import ForgotPassword from "@/pages/forgot-password";

export const Route = createFileRoute("/_auth/forgot-password")({
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(
      sessionQueryOptions(),
    );
    if (session?.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ForgotPassword,
});
