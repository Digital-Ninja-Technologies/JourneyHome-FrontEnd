import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokenSearchSchema } from "@/lib/search-schemas";
import { sessionQueryOptions } from "@/modules/auth";
import ResetPassword from "@/pages/reset-password";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: (search) => tokenSearchSchema.parse(search),
  beforeLoad: async ({ context }) => {
    const session = await context.queryClient.ensureQueryData(
      sessionQueryOptions(),
    );
    if (session?.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ResetPassword,
});
