import { createFileRoute, redirect } from "@tanstack/react-router";
import { signupSearchSchema } from "@/lib/search-schemas";
import { VerifyCodeView } from "@/modules/auth/components/verify-code-view";
import { sessionQueryOptions } from "@/modules/auth/query-options";

export const Route = createFileRoute("/signup/verify")({
  validateSearch: signupSearchSchema,
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { session, user: session.user };
  },
  component: VerifyCodeView,
});
