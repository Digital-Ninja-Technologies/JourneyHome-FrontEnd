import { ApiError } from "../lib/errors";

/**
 * Simulated server for endpoints the real backend doesn't have yet. State lives in localStorage.
 * Only used in demo mode (see USE_MOCKS in lib/api.ts). The contract these mirror is in docs/BACKEND_CONTRACT.md.
 */
export const NOT_MOCKED = Symbol("not-mocked");
export const DEMO_CODE = "123456";
export const DEMO_RESET_TOKEN = "demo-token";

export interface Preferences {
  paymentReminders: boolean;
  deficitAlerts: boolean;
  serviceUpdates: boolean;
  productNews: boolean;
}
export interface Card {
  _id: string;
  brand: string;
  last4: string;
  expMonth: number;
  expYear: number;
  isDefault: boolean;
}

const DEFAULT_PREFS: Preferences = {
  paymentReminders: true,
  deficitAlerts: true,
  serviceUpdates: true,
  productNews: false,
};
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function read<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* ignore */
  }
}

function sessionUser(): { id: string; name: string; email: string } {
  for (const store of [sessionStorage, localStorage]) {
    try {
      const raw = store.getItem("jh_session");
      if (raw) return JSON.parse(raw).user;
    } catch {
      /* ignore */
    }
  }
  throw new ApiError(401, "Please log in again.");
}

const bad = (message: string) => new ApiError(400, message);

export async function mockRequest(
  method: string,
  path: string,
  body: unknown,
): Promise<unknown | typeof NOT_MOCKED> {
  const b = (body ?? {}) as Record<string, string>;
  const route = `${method} ${path.split("?")[0]}`;
  const handlers: Record<string, () => unknown> = {
    "POST /auth/verification/send": () => ({ sent: true }),
    "POST /auth/verification/confirm": () => {
      if (b.code !== DEMO_CODE)
        throw bad("That code is incorrect or has expired.");
      return { verified: true };
    },
    "POST /auth/forgot-password": () => ({ sent: true }),
    "POST /auth/reset-password": () => {
      if (b.token !== DEMO_RESET_TOKEN)
        throw bad("This reset link is invalid or has expired.");
      if (!b.password || b.password.length < 6)
        throw bad("Password must be at least 6 characters.");
      return { reset: true };
    },
    "GET /auth/me": () => {
      const u = sessionUser();
      const since = read<string>(
        `jh_mock:since:${u.id}`,
        new Date().toISOString(),
      );
      write(`jh_mock:since:${u.id}`, since);
      return {
        ...u,
        ...read(`jh_mock:profile:${u.id}`, {}),
        createdAt: since,
        preferences: { ...DEFAULT_PREFS, ...read(`jh_mock:prefs:${u.id}`, {}) },
      };
    },
    "PATCH /auth/me": () => {
      const u = sessionUser();
      if (b.name !== undefined && b.name.trim().length < 2)
        throw bad("Please enter your full name.");
      write(`jh_mock:profile:${u.id}`, {
        ...read(`jh_mock:profile:${u.id}`, {}),
        ...b,
      });
      return { ...u, ...read(`jh_mock:profile:${u.id}`, {}) };
    },
    "PATCH /auth/me/password": () => {
      if (b.currentPassword === "wrong")
        throw bad("Your current password is incorrect.");
      if (!b.newPassword || b.newPassword.length < 6)
        throw bad("New password must be at least 6 characters.");
      return { changed: true };
    },
    "PATCH /auth/me/preferences": () => {
      const u = sessionUser();
      const next = { ...read(`jh_mock:prefs:${u.id}`, {}), ...b };
      write(`jh_mock:prefs:${u.id}`, next);
      return { ...DEFAULT_PREFS, ...next };
    },
    "DELETE /auth/me": () => ({ closed: true }),
    "GET /payments/methods": () => {
      const u = sessionUser();
      return read<Card[]>(`jh_mock:cards:${u.id}`, [
        {
          _id: "card_demo_1",
          brand: "Visa",
          last4: "4821",
          expMonth: 9,
          expYear: 2029,
          isDefault: true,
        },
      ]);
    },
    "POST /payments/methods/initialize": () => {
      const u = sessionUser();
      const cards = read<Card[]>(`jh_mock:cards:${u.id}`, []);
      write(`jh_mock:cards:${u.id}`, [
        ...cards,
        {
          _id: `card_demo_${Date.now()}`,
          brand: "Mastercard",
          last4: "1234",
          expMonth: 12,
          expYear: 2030,
          isDefault: cards.length === 0,
        },
      ]);
      return {
        authorizationUrl: `${window.location.origin}/app/profile?card_added=1`,
      };
    },
  };

  let handler = handlers[route];
  const del = /^DELETE \/payments\/methods\/(.+)$/.exec(route);
  if (!handler && del) {
    handler = () => {
      const u = sessionUser();
      const cards = read<Card[]>(`jh_mock:cards:${u.id}`, [
        {
          _id: "card_demo_1",
          brand: "Visa",
          last4: "4821",
          expMonth: 9,
          expYear: 2029,
          isDefault: true,
        },
      ]);
      const left = cards.filter((c) => c._id !== del[1]);
      if (left.length && !left.some((c) => c.isDefault))
        left[0].isDefault = true;
      write(`jh_mock:cards:${u.id}`, left);
      return { removed: true };
    };
  }
  if (!handler) return NOT_MOCKED;
  await sleep(350);
  return handler();
}
