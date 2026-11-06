import { createFileRoute, redirect } from "@tanstack/react-router";
import {
  resolveSelectedPackage,
  signupSearchSchema,
} from "@/lib/search-schemas";
import { sessionQueryOptions } from "@/modules/auth/query-options";
import { OnboardingPlanView } from "@/modules/onboarding/components/onboarding-plan-view";
import { getStoredSelectedPackage } from "@/modules/onboarding/storage";
import { plansQueryOptions } from "@/modules/plans/query-options";

export const Route = createFileRoute("/signup/plan")({
  validateSearch: signupSearchSchema,
  beforeLoad: async ({ context, location, search }) => {
    const session = await context.queryClient.query(sessionQueryOptions());
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }

    // Onboarding is only for accounts with no plans yet. Anyone who already has a plan
    // (in any status, including cancelled ones) gets the regular "new plan" dialog
    // instead, still carrying the package they picked on the marketing site.
    const hasPlans = await context.queryClient
      .fetchQuery(plansQueryOptions({ page: 1, limit: 1 }, session.user.id))
      .then((plans) => plans.length > 0)
      // If the check fails, let them through: the page has a "skip" link to /app.
      .catch(() => false);
    if (hasPlans) {
      const pkg = resolveSelectedPackage(search) ?? getStoredSelectedPackage();
      throw redirect({
        to: "/app/plans",
        search: { new: "1", ...(pkg ? { package: pkg } : {}) },
        replace: true,
      });
    }

    return { session, user: session.user };
  },
  component: OnboardingPlanView,
});
