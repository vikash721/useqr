"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import type { EmailCodeFactor } from "@clerk/types";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClerkErrorMessage } from "@/lib/clerk-error";

function GoogleIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 18 18"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.874 2.684-6.615z"
        fill="#4285F4"
      />
      <path
        d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
        fill="#34A853"
      />
      <path
        d="M3.964 10.71c-.18-.54-.282-1.117-.282-1.71 0-.593.102-1.17.282-1.71V4.958H.957C.347 6.173 0 7.548 0 9c0 1.452.348 2.827.957 4.042l3.007-2.332z"
        fill="#FBBC05"
      />
      <path
        d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z"
        fill="#EA4335"
      />
    </svg>
  );
}

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirect") || "/dashboard";
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");

  // Already signed in — redirect to dashboard (backup if middleware didn’t run)
  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace(redirectTo);
  }, [isLoaded, isSignedIn, router, redirectTo]);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [code, setCode] = useState("");
  const [showEmailCode, setShowEmailCode] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      const res = await signIn.create({ identifier: email, password });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push(redirectTo);
        return;
      }
      if (res.status === "needs_second_factor") {
        const emailCode = res.supportedSecondFactors?.find(
          (f): f is EmailCodeFactor => f.strategy === "email_code"
        );
        if (emailCode) {
          await signIn.prepareSecondFactor({
            strategy: "email_code",
            emailAddressId: emailCode.emailAddressId,
          });
          setShowEmailCode(true);
        }
        return;
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  const handleEmailCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      const res = await signIn.attemptSecondFactor({ strategy: "email_code", code });
      if (res.status === "complete") {
        await setActive({ session: res.createdSessionId });
        router.push(redirectTo);
      }
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, "Invalid code."));
    } finally {
      setLoading(false);
    }
  };

  const handleGoogle = () => {
    if (!isLoaded || !signIn || googleLoading) return;
    setGoogleLoading(true);
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    signIn.authenticateWithRedirect({
      strategy: "oauth_google",
      redirectUrl: `${origin}/sso-callback?redirect=${encodeURIComponent(redirectTo)}`,
      redirectUrlComplete: `${origin}${redirectTo.startsWith("/") ? redirectTo : `/${redirectTo}`}`,
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    );
  }

  if (showEmailCode) {
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center bg-black px-4 py-12">
        <div className="w-full max-w-[400px] rounded-none border border-white/10 bg-[#1a1a1a] px-8 py-10 shadow-xl">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white">
            Verify your email
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Enter the code sent to your email.
          </p>
          <form onSubmit={handleEmailCode} className="mt-6 flex flex-col gap-4">
            <Input
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Verification code"
              className="h-11 rounded-none border-white/10 bg-[#2b2b2b] text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
              autoComplete="one-time-code"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-none bg-emerald-500 font-medium text-white hover:bg-emerald-600"
            >
              {loading ? "Verifying…" : "Verify"}
            </Button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-[400px] rounded-none border border-white/10 bg-[#1a1a1a] px-8 py-10 shadow-xl">
        <h1 className="text-center text-2xl font-bold tracking-tight text-white">
          Log in
        </h1>
        {searchParams.get("redirect") && (
          <p className="mt-2 text-center text-sm text-zinc-400">
            Please log in to access the dashboard.
          </p>
        )}

        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogle}
            disabled={googleLoading}
            className="h-11 w-full cursor-pointer rounded-none border-white/20 bg-[#f3f4f6] text-black hover:bg-[#e5e7eb] dark:border-white/20 dark:bg-[#f3f4f6] dark:text-black dark:hover:bg-[#e5e7eb] disabled:pointer-events-auto disabled:cursor-wait"
          >
            <span className="flex items-center justify-center gap-3">
              {googleLoading ? (
                <span className="size-5 shrink-0 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" aria-hidden />
              ) : (
                <GoogleIcon className="size-5 shrink-0" />
              )}
              {googleLoading ? "Redirecting…" : "Google"}
            </span>
          </Button>
        </div>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-[#1a1a1a] px-3 text-zinc-500">
              or continue with email
            </span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-none border-white/10 bg-[#2b2b2b] text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="h-11 rounded-none border-white/10 bg-[#2b2b2b] pr-10 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          <div className="flex justify-start">
            <Link
              href="/forgot-password"
              className="text-sm text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline"
            >
              Forgot password?
            </Link>
          </div>
          {/* Clerk Smart CAPTCHA widget placeholder — required for custom sign-in when bot protection is enabled */}
          <div id="clerk-captcha" data-cl-theme="dark" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-none bg-emerald-500 font-medium text-white hover:bg-emerald-600"
          >
            {loading ? "Signing in…" : "Log in"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-white underline-offset-2 hover:underline">
            Sign up
          </Link>
        </p>
      </div>

      <p className="mt-10 max-w-[400px] text-center text-xs text-zinc-500">
        By continuing, you are agreeing to UseQR&apos;s{" "}
        <Link href="/terms" className="font-medium text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline">
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link href="/privacy" className="font-medium text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline">
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-svh w-full items-center justify-center bg-black">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
