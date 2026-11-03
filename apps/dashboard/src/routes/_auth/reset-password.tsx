import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokenSearchSchema } from "@/lib/search-schemas";
import { ResetPasswordForm, sessionQueryOptions } from "@/modules/auth";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: (search) => tokenSearchSchema.parse(search),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(
      sessionQueryOptions(),
    );
    if (session?.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ResetPasswordForm,
});
