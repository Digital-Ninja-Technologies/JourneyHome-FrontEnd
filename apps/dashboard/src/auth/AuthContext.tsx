import { createContext, useCallback, useContext, useMemo, useRef, useState } from "react";
import { api, configureApi } from "../lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
}

interface AuthResult {
  user: User;
  token: string;
}

interface AuthContextValue {
  user: User | null;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  signup: (name: string, email: string, password: string, phone?: string) => Promise<void>;
  updateUser: (patch: Partial<Pick<User, "name" | "email">>) => void;
  logout: () => void;
}

const STORAGE_KEY = "jh_session";
const AuthContext = createContext<AuthContextValue | null>(null);

interface Session extends AuthResult {
  remember: boolean;
}

function readSession(): Session | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY) ?? sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  try {
    localStorage.removeItem(STORAGE_KEY);
    sessionStorage.removeItem(STORAGE_KEY);
    if (session) (session.remember ? localStorage : sessionStorage).setItem(STORAGE_KEY, JSON.stringify(session));
  } catch {
    /* storage unavailable; session lasts until reload */
  }
}

// The customer app only admits customers; admins use the separate admin console.
function assertCustomer(user: User) {
  if (user.role === "admin" || user.role === "super_admin") {
    throw new Error("This is the customer app. Please use the admin console to log in.");
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
  }, []);

  // Configure the API client during the first render (not in an effect): child components start fetching in their own
  // effects, which run before this component's, and those first requests must already carry the token.
  const sessionRef = useRef(session);
  sessionRef.current = session;
  const logoutRef = useRef(logout);
  logoutRef.current = logout;
  useState(() => {
    configureApi({ getToken: () => sessionRef.current?.token ?? null, onUnauthorized: () => logoutRef.current() });
  });

  const start = useCallback((result: AuthResult, remember: boolean) => {
    assertCustomer(result.user);
    const next = { ...result, remember };
    writeSession(next);
    setSession(next);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      logout,
      login: async (email, password, remember) =>
        start(await api<AuthResult>("/auth/login", { body: { email, password } }), remember),
      // `phone` isn't stored by the current backend; it is sent so it can be kept once supported.
      signup: async (name, email, password, phone) =>
        start(await api<AuthResult>("/auth/signup", { body: { name, email, password, role: "customer", ...(phone && { phone }) } }), true),
      updateUser: (patch) =>
        setSession((cur) => {
          if (!cur) return cur;
          const next = { ...cur, user: { ...cur.user, ...patch } };
          writeSession(next);
          return next;
        }),
    }),
    [session, logout, start],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
