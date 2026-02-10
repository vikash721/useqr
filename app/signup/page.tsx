"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn, useSignUp } from "@clerk/nextjs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClerkErrorMessage } from "@/lib/clerk-error";
import { usersApi } from "@/lib/api";
import { useUserStore } from "@/stores/useUserStore";

/** Temporary password for create(); user signs in with this (no password step). Use Forgot password to set one later. */
function generateTempPassword(): string {
  return `tmp_${typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2)}_${Date.now()}`;
}

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

export default function SignupPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded: signInLoaded, signIn } = useSignIn();
  const { isLoaded: signUpLoaded, signUp, setActive } = useSignUp();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const isLoaded = signInLoaded && signUpLoaded;

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  // Step 1: Name + Email → send OTP
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    const trimmedName = name.trim();
    if (!trimmedName) {
      setError("Please enter your name.");
      return;
    }
    if (!isLoaded || !signUp) return;
    const [firstName, ...rest] = trimmedName.split(/\s+/);
    const lastName = rest.join(" ").trim() || undefined;
    setLoading(true);
    try {
      await signUp.create({
        emailAddress: email,
        password: generateTempPassword(),
        firstName: firstName || undefined,
        lastName: lastName || undefined,
      });
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" });
      setVerifying(true);
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  // Step 2: Verify OTP → setActive, sync user from DB, then redirect to dashboard
  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isLoaded || !signUp || !setActive) return;
    setLoading(true);
    try {
      const res = await signUp.attemptEmailAddressVerification({ code });
      if (res.status === "complete" && res.createdSessionId) {
        await setActive({ session: res.createdSessionId });
        // Brief wait so session cookie is set, then fetch user from DB for sidebar/dashboard
        await new Promise((r) => setTimeout(r, 200));
        try {
          const data = await usersApi.sync();
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
        } catch {
          // Sync may 401 if cookie not ready; UserSyncOnMount on dashboard will retry
        }
        router.push("/dashboard");
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
      redirectUrl: `${origin}/sso-callback`,
      redirectUrlComplete: `${origin}/dashboard`,
    });
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    );
  }

  if (verifying) {
    return (
      <div className="flex min-h-svh w-full flex-col items-center justify-center bg-black px-4 py-12">
        <div className="w-full max-w-[400px] rounded-none border border-white/10 bg-[#1a1a1a] px-8 py-10 shadow-xl">
          <h1 className="text-center text-2xl font-bold tracking-tight text-white">
            Verify your email
          </h1>
          <p className="mt-2 text-center text-sm text-zinc-400">
            Enter the code sent to {email}.
          </p>
          <form onSubmit={handleVerify} className="mt-6 flex flex-col gap-4">
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
          Sign up
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Get <span className="font-medium text-emerald-400">2 free QR codes</span> when you join—no card required.
        </p>

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
              {googleLoading ? "Redirecting…" : "Continue with Google"}
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
            type="text"
            placeholder="Full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 rounded-none border-white/10 bg-[#2b2b2b] text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
            autoComplete="name"
          />
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-11 rounded-none border-white/10 bg-[#2b2b2b] text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
          />
          {/* Clerk Smart CAPTCHA widget placeholder — required for custom sign-up when bot protection is enabled */}
          <div id="clerk-captcha" data-cl-theme="dark" />
          {error && <p className="text-sm text-red-400">{error}</p>}
          <Button
            type="submit"
            disabled={loading}
            className="h-11 w-full rounded-none bg-emerald-500 font-medium text-white hover:bg-emerald-600"
          >
            {loading ? "Sending code…" : "Continue"}
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-white underline-offset-2 hover:underline">
            Log in
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
