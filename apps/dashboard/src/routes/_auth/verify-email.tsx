import { createFileRoute } from "@tanstack/react-router";
import { tokenSearchSchema } from "@/lib/search-schemas";
import { VerifyEmailView } from "@/modules/auth/components/verify-email-view";

export const Route = createFileRoute("/_auth/verify-email")({
  validateSearch: tokenSearchSchema,
  component: VerifyEmailView,
});
