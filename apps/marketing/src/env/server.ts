import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    API_BASE_URL: z.string().url().default("http://localhost:4000/api/v1"),
    LOG_LEVEL: z.string().optional().default("info"),
    USE_MOCKS: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
