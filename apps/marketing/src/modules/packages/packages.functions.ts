import { createServerFn } from "@tanstack/react-start";
import { api, DUMMY_PACKAGES } from "@/lib/api";
import { type Package, packageSchema } from "./types";

interface CacheEntry {
  data: Package[];
  timestamp: number;
}

let packageCache: CacheEntry | null = null;
const CACHE_TTL_MS = 300 * 1000;

export const getPackagesFn = createServerFn({ method: "GET" }).handler(
  async () => {
    const now = Date.now();
    if (packageCache && now - packageCache.timestamp < CACHE_TTL_MS) {
      return packageCache.data;
    }

    try {
      const list = await api<Package[]>("/packages");
      const parsed = packageSchema.array().safeParse(list);

      if (parsed.success && parsed.data.length > 0) {
        const sorted = [...parsed.data].sort((a, b) => a.amount - b.amount);
        packageCache = { data: sorted, timestamp: now };
        return sorted;
      }
    } catch {
      // Backend unreachable or offline; fallback cleanly
    }

    const fallback = [...DUMMY_PACKAGES].sort((a, b) => a.amount - b.amount);
    packageCache = { data: fallback, timestamp: now };
    return fallback;
  },
);
