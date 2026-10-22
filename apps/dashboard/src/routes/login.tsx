import { createFileRoute, redirect } from "@tanstack/react-router";
import Login from "../pages/Login";

interface LoginSearch {
  redirect?: string;
}

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>): LoginSearch => ({
    redirect: search.redirect != null ? String(search.redirect) : undefined,
  }),
  beforeLoad: ({ context, search }) => {
    if (context.auth.user) {
      throw redirect({
        to: search.redirect || "/app",
      });
    }
  },
  component: Login,
});
