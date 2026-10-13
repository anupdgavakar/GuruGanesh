"use client";

import { createContext, useCallback, useContext, useEffect, useState } from "react";
import { getCurrentUserAction, logoutAction } from "@/actions/auth-actions";
import type { CustomerUser } from "@/lib/api/types";

interface AuthContextValue {
  /** undefined = still checking, null = signed out, CustomerUser = signed in. */
  user: CustomerUser | null | undefined;
  /** Re-checks the current session — call after a successful sign-in. */
  refresh: () => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/**
 * Whether a customer is signed in lives behind an httpOnly cookie only
 * server-side code can read (see lib/session.ts) — so, unlike the cart
 * (plain localStorage), this can't be read directly in the browser. Rather
 * than making the whole app dynamic by calling cookies() in the root
 * layout, this provider checks in on mount via a Server Action
 * (getCurrentUserAction), keeping every static/ISR page exactly as static
 * as it was before login existed.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<CustomerUser | null | undefined>(undefined);

  const refresh = useCallback(async () => {
    const current = await getCurrentUserAction();
    setUser(current);
  }, []);

  useEffect(() => {
    // Inlined (rather than calling `refresh` above) with an `ignore` guard —
    // the React-recommended shape for an effect that fetches once on mount:
    // https://react.dev/learn/you-might-not-need-an-effect#fetching-data
    let ignore = false;
    getCurrentUserAction().then((current) => {
      if (!ignore) setUser(current);
    });
    return () => {
      ignore = true;
    };
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    logoutAction();
  }, []);

  return <AuthContext.Provider value={{ user, refresh, logout }}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within an AuthProvider");
  return ctx;
}
