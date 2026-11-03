import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const env = createEnv({
  clientPrefix: "VITE_",
  client: {
    VITE_APP_URL: z.string().url().default("http://localhost:5173"),
    VITE_SITE_URL: z.string().url().default("https://journeyhome.ng"),
  },
  runtimeEnv: import.meta.env,
  emptyStringAsUndefined: true,
});
