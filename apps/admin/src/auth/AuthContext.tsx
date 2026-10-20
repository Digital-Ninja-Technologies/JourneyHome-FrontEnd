import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { api, configureApi } from "../lib/api";

export interface User {
  id: string;
  email: string;
  name: string;
  role: string;
  isSuperAdmin: boolean;
}

interface AuthContextValue {
  user: User | null;
  isSuperAdmin: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

interface Session {
  user: User;
  token: string;
}

// Admin sessions last only for the browser tab (no "remember me").
const STORAGE_KEY = "jh_admin_session";
const AuthContext = createContext<AuthContextValue | null>(null);

function readSession(): Session | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

function writeSession(session: Session | null) {
  try {
    if (session) sessionStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable; session lasts until reload */
  }
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(readSession);
  const queryClient = useQueryClient();

  const logout = useCallback(() => {
    writeSession(null);
    setSession(null);
    queryClient.clear();
  }, [queryClient]);

  useEffect(() => {
    configureApi({ getToken: () => session?.token ?? null, onUnauthorized: logout });
  }, [session, logout]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user: session?.user ?? null,
      isSuperAdmin: !!session && (session.user.isSuperAdmin || session.user.role === "super_admin"),
      logout,
      login: async (email, password) => {
        const result = await api<Session>("/auth/admin/login", { body: { email, password } });
        writeSession(result);
        setSession(result);
      },
    }),
    [session, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
