"use client";

import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";

/**
 * OAuth callback. Required when using authenticateWithRedirect (e.g. Google).
 * Redirects to /dashboard after successful sign-in or sign-up.
 */
export default function SSOCallbackPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-black">
      <AuthenticateWithRedirectCallback
        signInFallbackRedirectUrl="/dashboard"
        signUpFallbackRedirectUrl="/dashboard"
        signInForceRedirectUrl="/dashboard"
        signUpForceRedirectUrl="/dashboard"
      />
    </div>
  );
}
