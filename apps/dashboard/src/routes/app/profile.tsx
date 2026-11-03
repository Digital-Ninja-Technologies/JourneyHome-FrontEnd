import { createFileRoute } from "@tanstack/react-router";
import { profileSearchSchema } from "@/lib/search-schemas";
import { ProfileView } from "@/modules/profile";

export const Route = createFileRoute("/app/profile")({
  validateSearch: (search) => profileSearchSchema.parse(search),
  component: ProfileView,
});
