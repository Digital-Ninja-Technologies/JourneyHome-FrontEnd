import { createFileRoute, redirect } from "@tanstack/react-router";
import { signupSearchSchema } from "@/lib/search-schemas";
import { sessionQueryOptions, VerifyCodeView } from "@/modules/auth";

export const Route = createFileRoute("/signup/verify")({
  validateSearch: (search) => signupSearchSchema.parse(search),
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
  component: VerifyCodeView,
});
