import { createFileRoute } from "@tanstack/react-router";
import Plans from "../../../pages/Plans";

interface PlansSearch {
  new?: string;
}

export const Route = createFileRoute("/app/plans/")({
  validateSearch: (search: Record<string, unknown>): PlansSearch => ({
    new: typeof search.new === "string" ? search.new : undefined,
  }),
  component: Plans,
});
