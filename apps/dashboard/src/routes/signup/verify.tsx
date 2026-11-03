import { createFileRoute } from "@tanstack/react-router";
import { verifyEmailSearchSchema } from "@/lib/search-schemas";
import { VerifyCodeView } from "@/modules/auth/components/verify-code-view";

export const Route = createFileRoute("/signup/verify")({
  validateSearch: verifyEmailSearchSchema,
  component: VerifyCodeView,
});
