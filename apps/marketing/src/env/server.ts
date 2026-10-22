import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    APP_URL: z.string().url().default("http://localhost:5173"),
    SITE_URL: z.string().url().default("https://journeyhome.ng"),
    LOG_LEVEL: z.string().optional().default("info"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
