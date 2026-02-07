"use client";

import { useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * OAuth callback. Required when using authenticateWithRedirect (e.g. Google).
 * Redirects to ?redirect= or /dashboard after successful sign-in or sign-up.
 */
export default function SSOCallbackPage() {
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
