import { createFileRoute } from "@tanstack/react-router";
import { profileSearchSchema } from "@/lib/search-schemas";
import Profile from "@/pages/profile";

export const Route = createFileRoute("/app/profile")({
  validateSearch: (search) => profileSearchSchema.parse(search),
  component: Profile,
});
