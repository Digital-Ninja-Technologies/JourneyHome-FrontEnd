import { createFileRoute, redirect } from "@tanstack/react-router";
import { signupSearchSchema } from "@/lib/search-schemas";
import { sessionQueryOptions } from "@/modules/auth/query-options";
import { OnboardingPlanView } from "@/modules/onboarding/components/onboarding-plan-view";

export const Route = createFileRoute("/signup/plan")({
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
  component: OnboardingPlanView,
});
