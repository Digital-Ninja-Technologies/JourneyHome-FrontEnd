import { createServerFn } from "@tanstack/react-start";
import { api } from "@/lib/api";
import { type Package, packageSchema } from "./types";

interface CacheEntry {
  data: Package[];
  timestamp: number;
}

let packageCache: CacheEntry | null = null;
const CACHE_TTL_MS = 300 * 1000;

/**
 * Lists the packages customers can sign up for. Only real packages from the API are ever
 * returned: their ids go into the signup links, so made-up stand-ins would break signup.
 * When the API is unreachable or answers with something unexpected this throws (and caches
 * nothing), and the page shows "pricing unavailable" with a retry instead.
 */
export const getPackagesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const now = Date.now();
    if (packageCache && now - packageCache.timestamp < CACHE_TTL_MS) {
      return packageCache.data;
    }

    const list = await api<Package[]>("/packages");
    const parsed = packageSchema.array().safeParse(list);
    if (!parsed.success) {
      throw new Error("Invalid packages response from server");
    }

    const sorted = [...parsed.data].sort((a, b) => a.amount - b.amount);
    packageCache = { data: sorted, timestamp: now };
    return sorted;
  },
);
