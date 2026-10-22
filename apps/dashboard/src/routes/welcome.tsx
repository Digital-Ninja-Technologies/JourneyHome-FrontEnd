import { createFileRoute, redirect } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import { sessionQueryOptions } from "@/modules/auth";
import Welcome from "@/pages/welcome";

export const Route = createFileRoute("/welcome")({
  validateSearch: (search) => planSearchSchema.parse(search),
  beforeLoad: async ({ context, location }) => {
    const session = await context.queryClient.ensureQueryData(
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
  component: Welcome,
});
