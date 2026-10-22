import { api, ApiError, USE_MOCKS } from "@/lib/api";
import type { LoginInput, SignupInput } from "@journeyhome/schemas";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
}

export interface Session {
  user: User;
  token: string;
  remember?: boolean;
}

const STORAGE_KEY = "jh_session";

export function readSession(): Session | null {
  try {
    for (const store of [sessionStorage, localStorage]) {
      const raw = store.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw) as Session;
    }
    return null;
  } catch {
    return null;
  }
}

export function writeSession(session: Session | null) {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (session) {
      const store = session.remember ? localStorage : sessionStorage;
      store.setItem(STORAGE_KEY, JSON.stringify(session));
    }
  } catch {
    /* storage unavailable */
  }
}

function assertCustomer(user: User) {
  if (user.role === "admin" || user.role === "super_admin") {
    throw new Error(
      "This is the customer app. Please use the admin console to log in.",
    );
  }
}

export async function fetchSession(): Promise<Session | null> {
  const session = readSession();
  if (!session) return null;

  if (USE_MOCKS) {
    return session;
  }

  try {
    const me = await api<User>("/auth/me");
    const updated: Session = {
      ...session,
      user: {
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role,
        isSuperAdmin: Boolean(me.isSuperAdmin),
      },
    };
    writeSession(updated);
    return updated;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      writeSession(null);
      return null;
    }
    return session;
  }
}

export async function login(
  input: LoginInput & { remember?: boolean },
): Promise<Session> {
  const res = await api<{ user: User; token: string }>("/auth/login", {
    body: {
      email: input.email.trim(),
      password: input.password,
    },
  });

  assertCustomer(res.user);

  const session: Session = {
    user: res.user,
    token: res.token,
    remember: Boolean(input.remember),
  };

  writeSession(session);
  return session;
}

export async function signup(
  input: SignupInput & { phone?: string },
): Promise<Session> {
  const res = await api<{ user: User; token: string }>("/auth/signup", {
    body: {
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      role: "customer",
      ...(input.phone && { phone: input.phone }),
    },
  });

  assertCustomer(res.user);

  const session: Session = {
    user: res.user,
    token: res.token,
    remember: true,
  };

  writeSession(session);
  return session;
}

export async function logout(): Promise<void> {
  writeSession(null);
}

export async function sendVerificationCode(): Promise<{ sent: boolean }> {
  return api<{ sent: boolean }>("/auth/verification/send", { method: "POST" });
}

export async function verifyCode(code: string): Promise<{ verified: boolean }> {
  return api<{ verified: boolean }>("/auth/verification/confirm", {
    body: { code },
  });
}

export async function forgotPassword(
  email: string,
): Promise<{ sent: boolean }> {
  return api<{ sent: boolean }>("/auth/forgot-password", {
    body: { email },
  });
}

export async function resetPassword(
  token: string,
  password: string,
): Promise<{ reset: boolean }> {
  return api<{ reset: boolean }>("/auth/reset-password", {
    body: { token, password },
  });
}

export function updateUserLocally(
  patch: Partial<Pick<User, "name" | "email">>,
): Session | null {
  const cur = readSession();
  if (!cur) return null;
  const next: Session = {
    ...cur,
    user: { ...cur.user, ...patch },
  };
  writeSession(next);
  return next;
}
