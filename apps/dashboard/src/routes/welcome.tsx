import { createFileRoute, redirect } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import { sessionQueryOptions } from "@/modules/auth/query-options";
import { WelcomeView } from "@/modules/onboarding/components/welcome-view";

export const Route = createFileRoute("/welcome")({
  validateSearch: (search) => planSearchSchema.parse(search),
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.query(
      sessionQueryOptions(),
    );
    if (!session?.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
    return { session, user: session.user };
  },
  component: WelcomeView,
});
