import { createFileRoute, redirect } from "@tanstack/react-router";
import { redirectSearchSchema } from "@/lib/search-schemas";
import Login from "@/pages/login";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => redirectSearchSchema.parse(search),
  beforeLoad: ({ context, search }) => {
    if (context.auth.user) {
      throw redirect({
        to: search.redirect || "/app",
      });
    }
  },
  component: Login,
});
