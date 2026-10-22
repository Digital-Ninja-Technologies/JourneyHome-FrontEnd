import { createFileRoute, redirect } from "@tanstack/react-router";
import { AsyncBoundary } from "@/components/async-boundary";
import { redirectSearchSchema } from "@/lib/search-schemas";
import { adminSessionQueryOptions } from "@/modules/auth";
import Login from "@/pages/login";

export const Route = createFileRoute("/login")({
  validateSearch: (search) => redirectSearchSchema.parse(search),
  beforeLoad: async ({ context, search }) => {
    const session = await context.queryClient.query(
      adminSessionQueryOptions(),
    );
    if (session?.user) {
      throw redirect({
        to: search.redirect || "/",
      });
    }
  },
  component: LoginPage,
});

function LoginPage() {
  return (
    <AsyncBoundary>
      <Login />
    </AsyncBoundary>
  );
}
