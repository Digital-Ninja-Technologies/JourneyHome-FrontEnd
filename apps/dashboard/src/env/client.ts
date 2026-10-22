import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_API_BASE_URL: z.url().default("http://localhost:4000/api/v1"),
    VITE_MARKETING_URL: z.url().default("http://localhost:3000"),
    VITE_APP_URL: z.url().default("http://localhost:5173"),
    VITE_USE_MOCKS: z
      .string()
      .optional()
      .default(import.meta.env.DEV ? "true" : "false")
      .transform((val) => val === "true"),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
