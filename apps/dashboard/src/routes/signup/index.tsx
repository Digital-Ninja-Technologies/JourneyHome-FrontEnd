import { createFileRoute, redirect } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import {
  resolveSelectedPackage,
  sanitizeRedirect,
  signupSearchSchema,
} from "@/lib/search-schemas";
import { SignupForm } from "@/modules/auth/components/signup-form";
import { sessionQueryOptions } from "@/modules/auth/query-options";

export const Route = createFileRoute("/signup/")({
  validateSearch: signupSearchSchema,
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (session?.user) {
      const selected = resolveSelectedPackage(search);
      if (selected) {
        throw redirect({
          to: "/signup/plan",
          search: { package: selected },
        });
      }
      const target = sanitizeRedirect(search.redirect, "/app");
      throw redirect({ to: target as any });
    }
  },
  component: SignupPage,
});

function SignupPage() {
  return (
    <AsyncBoundary>
      <SignupForm />
    </AsyncBoundary>
  );
}
