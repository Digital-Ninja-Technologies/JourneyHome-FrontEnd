import { createApiClient } from "@journeyhome/api-client";
import { env } from "#/env/client";

export const apiClient = createApiClient({
  baseUrl: env.VITE_API_BASE_URL,
});
