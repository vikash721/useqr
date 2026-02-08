"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { AuthenticateWithRedirectCallback } from "@clerk/nextjs";
import { useLottie } from "lottie-react";

/**
 * Renders Lottie when animation data is available.
 */
function LottiePlayer({ animationData }: { animationData: object }) {
  const { View } = useLottie({ animationData, loop: true });
  return (
    <div className="flex h-48 w-48 shrink-0 items-center justify-center sm:h-56 sm:w-56">
      {View}
    </div>
  );
}

/**
 * Lottie loading animation during SSO callback. Fetches from public and loops.
 */
function SSOLottieLoader() {
  const [animationData, setAnimationData] = useState<object | null>(null);

  useEffect(() => {
    fetch("/lottie/loading.json")
      .then((res) => res.json())
      .then(setAnimationData)
      .catch(() => setAnimationData(null));
  }, []);

  if (!animationData) {
    return (
      <div className="h-24 w-24 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
    );
  }

  return <LottiePlayer animationData={animationData} />;
}

/**
 * OAuth callback. Required when using authenticateWithRedirect (e.g. Google).
 * Redirects to ?redirect= or /dashboard after successful sign-in or sign-up.
 */
function SSOCallbackContent() {
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const path = redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`;

  return (
    <div className="relative flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-black">
      <SSOLottieLoader />
      <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
        Signing you in…
      </p>
      {/* Clerk callback runs in background; our Lottie is the visible loading state */}
      <div className="absolute inset-0 flex items-center justify-center opacity-0 pointer-events-none">
        <AuthenticateWithRedirectCallback
          signInFallbackRedirectUrl={path}
          signUpFallbackRedirectUrl={path}
          signInForceRedirectUrl={path}
          signUpForceRedirectUrl={path}
        />
      </div>
    </div>
  );
}

export default function SSOCallbackPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full flex-col items-center justify-center gap-6 bg-black">
          <div className="h-24 w-24 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
          <p className="text-sm uppercase tracking-[0.2em] text-zinc-500">
            Loading…
          </p>
        </div>
      }
    >
      <SSOCallbackContent />
    </Suspense>
  );
}
