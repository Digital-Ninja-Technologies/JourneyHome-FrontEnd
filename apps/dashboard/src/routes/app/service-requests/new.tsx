import { createFileRoute } from "@tanstack/react-router";
import RequestService from "../../../pages/RequestService";

interface RequestServiceSearch {
  plan?: string;
}

export const Route = createFileRoute("/app/service-requests/new")({
  validateSearch: (search: Record<string, unknown>): RequestServiceSearch => ({
    plan: typeof search.plan === "string" ? search.plan : undefined,
  }),
  component: RequestService,
});
