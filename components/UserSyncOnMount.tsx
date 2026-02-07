"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { api } from "@/lib/axios";
import { useUserStore } from "@/stores/useUserStore";

/**
 * When the user is signed in, sync their Clerk profile to our DB (e.g. after login/signup or OAuth).
 * Runs after redirect so the session cookie is set before the request. Retries once on 401 in case
 * the cookie isn't ready on first paint. Updates the user store on success for sidebar and persistence.
 */
export function UserSyncOnMount() {
  const { isSignedIn } = useAuth();
  const synced = useRef(false);

  useEffect(() => {
    if (!isSignedIn || synced.current) return;

    const sync = (isRetry = false) => {
      api
        .post<{ ok: boolean; user: { clerkId: string; email: string | null; name: string | null; imageUrl: string | null; plan: string; createdAt?: string } }>("/api/users/sync")
        .then((res) => {
          const data = res.data;
          if (data?.ok && data.user) {
            useUserStore.getState().setUser({
              clerkId: data.user.clerkId,
              email: data.user.email ?? null,
              name: data.user.name ?? null,
              imageUrl: data.user.imageUrl ?? null,
              plan: data.user.plan,
              createdAt: data.user.createdAt,
            });
          }
          synced.current = true;
        })
        .catch((err) => {
          const is401 = err.response?.status === 401;
          if (is401 && !isRetry) {
            setTimeout(() => sync(true), 800);
            return;
          }
          synced.current = true;
        });
    };

    sync();
  }, [isSignedIn]);

  return null;
}
