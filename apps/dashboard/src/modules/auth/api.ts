import {
  authLoginResponseSchema,
  type LoginInput,
  type SignupInput,
} from "@journeyhome/schemas";
import { z } from "zod";
import { ApiError, api, parseApiResponse, USE_MOCKS } from "@/lib/api";

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
export const PENDING_EMAIL_KEY = "jh_pending_verification_email";

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

export function getPendingVerificationEmail(): string | null {
  try {
    return sessionStorage.getItem(PENDING_EMAIL_KEY);
  } catch {
    return null;
  }
}

export function setPendingVerificationEmail(email: string | null) {
  try {
    if (email) sessionStorage.setItem(PENDING_EMAIL_KEY, email);
    else sessionStorage.removeItem(PENDING_EMAIL_KEY);
  } catch {
    /* ignore */
  }
}

function assertCustomer(user: User) {
  if (user.role === "admin" || user.role === "super_admin") {
    throw new Error(
      "This is the customer app. Please use the admin console to log in.",
    );
  }
}

const userProfileSchema = z
  .object({
    id: z.string().optional(),
    _id: z.string().optional(),
    email: z.email(),
    name: z.string(),
    role: z.string().optional(),
    isSuperAdmin: z.boolean().optional(),
  })
  .transform((u) => ({
    id: u.id || u._id || "",
    email: u.email,
    name: u.name,
    role: u.role || "customer",
    isSuperAdmin: Boolean(u.isSuperAdmin),
  }));

export async function fetchSession(): Promise<Session | null> {
  const session = readSession();
  if (!session) return null;

  if (USE_MOCKS) {
    return session;
  }

  try {
    const raw = await api<unknown>("/auth/me");
    const me = parseApiResponse(
      userProfileSchema,
      raw,
      "Invalid profile response from server",
    );
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
  try {
    const raw = await api<unknown>("/auth/login", {
      body: {
        email: input.email.trim(),
        password: input.password,
      },
    });

    const res = parseApiResponse(
      authLoginResponseSchema,
      raw,
      "Invalid login response from server",
    );

    assertCustomer(res.user);

    const session: Session = {
      user: res.user,
      token: res.token,
      remember: Boolean(input.remember),
    };

    writeSession(session);
    setPendingVerificationEmail(null);
    return session;
  } catch (err) {
    if (
      err instanceof ApiError &&
      (err.status === 401 || err.status === 403) &&
      /verify|unverified/i.test(err.message)
    ) {
      setPendingVerificationEmail(input.email.trim());
    }
    throw err;
  }
}

export async function signup(
  input: SignupInput,
): Promise<{ success: boolean; message: string; email: string }> {
  const res = await api<{ message?: string; email?: string }>("/auth/signup", {
    body: {
      name: input.name.trim(),
      email: input.email.trim(),
      password: input.password,
      role: input.role ?? "customer",
    },
  });

  const email = res?.email ?? input.email.trim();
  setPendingVerificationEmail(email);

  return {
    success: true,
    message:
      res?.message ??
      "Signup completed. Check your email to verify the account before logging in.",
    email,
  };
}

export async function logout(): Promise<void> {
  writeSession(null);
  setPendingVerificationEmail(null);
  try {
    sessionStorage.removeItem("jh_selected_package");
    localStorage.removeItem("jh_selected_package");
    sessionStorage.removeItem("jh_onboarding_plan");
  } catch {
    // ignore
  }
}

export async function verifyEmail(
  token: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await api<{ message?: string }>("/auth/verify-email", {
    method: "POST",
    body: { token: token.trim() },
  });
  // Note: pending verification email is preserved so the login page can prefill it.
  // It is cleaned upon successful login(), logout(), deleteAccount(), or /app entry.
  return { success: true, message: res?.message };
}

export async function resendVerification(
  email: string,
): Promise<{ success: boolean; message?: string }> {
  const res = await api<{ message?: string }>("/auth/resend-verification", {
    method: "POST",
    body: { email: email.trim() },
  });
  return { success: true, message: res?.message };
}

export async function forgotPassword(
  email: string,
): Promise<{ sent: boolean; message?: string }> {
  const res = await api<{ message?: string }>("/auth/forgot-password", {
    body: { email: email.trim() },
  });
  return {
    sent: true,
    message: res?.message ?? "Password reset instructions sent to your email",
  };
}

export async function resetPassword(
  token: string,
  newPassword: string,
): Promise<{ reset: boolean; message?: string }> {
  const res = await api<{ message?: string }>("/auth/reset-password", {
    body: { token: token.trim(), newPassword },
  });
  return {
    reset: true,
    message: res?.message ?? "Password reset successful",
  };
}

export async function deleteAccount(password: string): Promise<void> {
  await api("/auth/me", {
    method: "DELETE",
    body: { password },
  });
  writeSession(null);
  setPendingVerificationEmail(null);
  try {
    sessionStorage.removeItem("jh_selected_package");
    localStorage.removeItem("jh_selected_package");
    sessionStorage.removeItem("jh_onboarding_plan");
  } catch {
    // ignore
  }
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
