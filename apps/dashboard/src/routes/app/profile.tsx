import { createFileRoute } from "@tanstack/react-router";
import Profile from "../../pages/Profile";

interface ProfileSearch {
  card_added?: string;
}

export const Route = createFileRoute("/app/profile")({
  validateSearch: (search: Record<string, unknown>): ProfileSearch => ({
    card_added: search.card_added != null ? String(search.card_added) : undefined,
  }),
  component: Profile,
});
