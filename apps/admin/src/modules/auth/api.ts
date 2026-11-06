import {
  type AdminLoginInput,
  type AdminMe,
  type AuthUser,
  adminMeSchema,
  authLoginResponseSchema,
} from "@journeyhome/schemas";
import {
  ApiError,
  api,
  parseApiResponse,
  SESSION_KEY,
  USE_MOCKS,
} from "@/lib/api";

export type AdminSessionUser = Pick<
  AuthUser,
  "id" | "email" | "name" | "role" | "isSuperAdmin"
>;

export interface AdminSession {
  user: AdminSessionUser;
  token: string;
}

/** Admin sessions live in sessionStorage, so closing the tab signs out. */
export function readSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function writeSession(session: AdminSession | null) {
  try {
    if (session) sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(SESSION_KEY);
  } catch {
    /* storage unavailable */
  }
}

const isStaff = (role: string) => role === "admin" || role === "super_admin";

function toSessionUser(u: AdminSessionUser): AdminSessionUser {
  return {
    id: u.id,
    email: u.email,
    name: u.name,
    role: u.role,
    isSuperAdmin: Boolean(u.isSuperAdmin || u.role === "super_admin"),
  };
}

export async function fetchMe(): Promise<AdminMe> {
  const res = await api<unknown>("/auth/me");
  return parseApiResponse(
    adminMeSchema,
    res,
    "Invalid profile response from server",
  );
}

/** Revalidates the stored session against `/auth/me`. */
export async function fetchSession(): Promise<AdminSession | null> {
  const session = readSession();
  if (!session) return null;
  if (USE_MOCKS) return session;

  try {
    const me = await fetchMe();
    if (!isStaff(me.role)) {
      writeSession(null);
      return null;
    }
    const updated: AdminSession = { ...session, user: toSessionUser(me) };
    writeSession(updated);
    return updated;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      writeSession(null);
      return null;
    }
    // Network blips keep the cached session; the API will reject a bad token.
    return session;
  }
}

/** Staff sign in through the shared `POST /auth/login`; customer accounts are refused. */
export async function login(input: AdminLoginInput): Promise<AdminSession> {
  const raw = await api<unknown>("/auth/login", {
    body: { email: input.email.trim(), password: input.password },
  });
  const res = parseApiResponse(
    authLoginResponseSchema,
    raw,
    "Invalid login response from server",
  );

  if (!isStaff(res.user.role)) {
    throw new Error(
      "This account isn't a staff account. Customers sign in on the Journey Home app.",
    );
  }

  const session: AdminSession = {
    user: toSessionUser(res.user),
    token: res.token,
  };
  writeSession(session);
  return session;
}

export async function logout(): Promise<void> {
  writeSession(null);
}
