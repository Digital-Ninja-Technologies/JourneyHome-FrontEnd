import { createFileRoute, redirect } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import {
  resolveSelectedPackage,
  signupSearchSchema,
} from "@/lib/search-schemas";
import { sessionQueryOptions } from "@/modules/auth";
import { SignupForm } from "@/modules/auth/components/signup-form";

export const Route = createFileRoute("/signup/")({
  validateSearch: (search) => signupSearchSchema.parse(search),
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (session?.user) {
      const selected = resolveSelectedPackage(search);
      // Logged-in customers go straight to plan setup with their chosen package.
      if (selected) {
        throw redirect({
          to: "/signup/plan",
          search: { package: selected },
        });
      }
      throw redirect({ to: "/app" });
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
