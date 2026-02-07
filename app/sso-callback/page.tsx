"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * OAuth callback. Required when using authenticateWithRedirect (e.g. Google).
 * Redirects to ?redirect= or /dashboard after successful sign-in or sign-up.
 */
function SSOCallbackContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const path = redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`;

  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-black">
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl={path}
        signUpFallbackRedirectUrl={path}
        signInForceRedirectUrl={path}
        signUpForceRedirectUrl={path}
      />
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
        </div>
      }
    >
      <SSOCallbackContent />
    </Suspense>
  );
}
