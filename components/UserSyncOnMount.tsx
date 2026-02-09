"use client";

import { useAuth } from "@clerk/nextjs";
import { useEffect, useRef } from "react";
import { usersApi } from "@/lib/api";
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
    if (!isSignedIn) {
      synced.current = false;
      return;
    }
    if (synced.current) return;

    const delays = [0, 800, 2000];
    let attempt = 0;

    const runSync = () => {
      usersApi
        .sync()
        .then((data) => {
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
          const nextAttempt = attempt + 1;
          if (is401 && nextAttempt < delays.length) {
            attempt = nextAttempt;
            setTimeout(runSync, delays[nextAttempt]);
            return;
          }
          synced.current = true;
        });
    };

    runSync();
  }, [isSignedIn]);

  return null;
}
