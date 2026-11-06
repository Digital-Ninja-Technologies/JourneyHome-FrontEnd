import { createEnv } from "@t3-oss/env-core";
import { z } from "zod";

export const serverEnv = createEnv({
  server: {
    USE_MOCKS: z
      .string()
      .optional()
      .transform((v) => v === "true" || v === "1"),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
