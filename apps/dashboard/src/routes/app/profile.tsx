import { createFileRoute } from "@tanstack/react-router";
import { profileSearchSchema } from "@/lib/search-schemas";
import { ProfileView } from "@/modules/profile/components/profile-view";

export const Route = createFileRoute("/app/profile")({
  validateSearch: profileSearchSchema,
  component: ProfileView,
});
