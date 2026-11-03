import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokenSearchSchema } from "@/lib/search-schemas";
import { ResetPasswordForm } from "@/modules/auth/components/reset-password-form";
import { sessionQueryOptions } from "@/modules/auth/query-options";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: (search) => tokenSearchSchema.parse(search),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (session?.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ResetPasswordForm,
});
