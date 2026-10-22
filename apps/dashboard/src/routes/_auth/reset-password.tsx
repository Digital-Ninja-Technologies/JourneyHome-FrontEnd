import { createFileRoute, redirect } from "@tanstack/react-router";
import { tokenSearchSchema } from "@/lib/search-schemas";
import ResetPassword from "@/pages/reset-password";

export const Route = createFileRoute("/_auth/reset-password")({
  validateSearch: (search) => tokenSearchSchema.parse(search),
  beforeLoad: ({ context }) => {
    if (context.auth.user) {
      throw redirect({ to: "/app" });
    }
  },
  component: ResetPassword,
});
