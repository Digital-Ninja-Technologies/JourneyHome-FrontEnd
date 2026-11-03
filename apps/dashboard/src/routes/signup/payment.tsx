import { createFileRoute, redirect } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import { sessionQueryOptions } from "@/modules/auth/query-options";
import { OnboardingPaymentView } from "@/modules/onboarding/components/onboarding-payment-view";

export const Route = createFileRoute("/signup/payment")({
  validateSearch: planSearchSchema,
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
  component: OnboardingPaymentView,
});
