import { createFileRoute, redirect } from "@tanstack/react-router";
import { planSearchSchema } from "@/lib/search-schemas";
import Welcome from "@/pages/welcome";

export const Route = createFileRoute("/welcome")({
  validateSearch: (search) => planSearchSchema.parse(search),
  beforeLoad: ({ context, location }) => {
    if (!context.auth.user) {
      throw redirect({
        to: "/login",
        search: { redirect: location.href },
      });
    }
  },
  component: Welcome,
});
