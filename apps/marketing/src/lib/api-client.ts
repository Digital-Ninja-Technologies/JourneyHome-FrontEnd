import { createApiClient } from "@journeyhome/api-client";
import { serverEnv as env } from "#/env/server";

export const apiClient = createApiClient({
  baseUrl: env.API_BASE_URL,
});
