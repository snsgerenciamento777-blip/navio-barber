"use client";

import { useState, useCallback, useEffect } from "react";
import { trpc, setCsrfToken } from "@/lib/trpc";
import { useRouter } from "next/navigation";

export type UserSession = {
  id: string;
  email: string;
  name?: string | null;
  role?: string;
  csrfToken?: string | null;
};

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const meQuery = trpc.auth.me.useQuery(undefined);

  useEffect(() => {
    if (meQuery.data) {
      const u = meQuery.data.user as UserSession;
      setUser(u);
      if (u.csrfToken) {
        setCsrfToken(u.csrfToken);
      }
      setError(null);
      setLoading(false);
    } else if (meQuery.error) {
      setUser(null);
      setError(meQuery.error.message || "Não autenticado");
      setLoading(false);
    } else if (!meQuery.isFetching) {
      setUser(null);
      setLoading(false);
    }
  }, [meQuery.data, meQuery.error, meQuery.isFetching]);

  const logout = useCallback(async () => {
    try {
      const res = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (!res.ok) {
        console.error("Logout falhou", res.status);
      }
    } catch {
      // Ignore errors — still clear local state
    }
    setUser(null);
    setCsrfToken(null);
    router.push("/login");
  }, [router]);

  return {
    user,
    isAuthenticated: !!user,
    isLoading: loading,
    error,
    logout,
    isFetching: meQuery.isFetching,
  };
}
