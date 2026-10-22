import { api, ApiError, USE_MOCKS } from "@/lib/api";
import type { AdminLoginInput } from "@journeyhome/schemas";

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
}

export interface AdminSession {
  user: AdminUser;
  token: string;
}

const STORAGE_KEY = "jh_admin_session";

export function readAdminSession(): AdminSession | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as AdminSession) : null;
  } catch {
    return null;
  }
}

export function writeAdminSession(session: AdminSession | null) {
  try {
    if (session) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    } else {
      sessionStorage.removeItem(STORAGE_KEY);
    }
  } catch {
    /* storage unavailable */
  }
}

export async function fetchAdminSession(): Promise<AdminSession | null> {
  const session = readAdminSession();
  if (!session) return null;

  if (USE_MOCKS) {
    return session;
  }

  try {
    const me = await api<AdminUser>("/auth/me");
    const updated: AdminSession = {
      ...session,
      user: {
        id: me.id,
        email: me.email,
        name: me.name,
        role: me.role,
        isSuperAdmin: Boolean(
          me.isSuperAdmin || me.role === "super_admin",
        ),
      },
    };
    writeAdminSession(updated);
    return updated;
  } catch (err) {
    if (err instanceof ApiError && err.status === 401) {
      writeAdminSession(null);
      return null;
    }
    return session;
  }
}

export async function adminLogin(
  input: AdminLoginInput,
): Promise<AdminSession> {
  const res = await api<{ user: AdminUser; token: string }>(
    "/auth/admin/login",
    {
      body: {
        email: input.email.trim(),
        password: input.password,
      },
    },
  );

  const session: AdminSession = {
    user: {
      ...res.user,
      isSuperAdmin: Boolean(
        res.user.isSuperAdmin || res.user.role === "super_admin",
      ),
    },
    token: res.token,
  };

  writeAdminSession(session);
  return session;
}

export async function adminLogout(): Promise<void> {
  writeAdminSession(null);
}
