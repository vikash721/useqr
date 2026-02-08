"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth, useSignIn } from "@clerk/nextjs";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getClerkErrorMessage } from "@/lib/clerk-error";

const RESEND_COOLDOWN_SEC = 60;

export default function ForgotPasswordPage() {
  const router = useRouter();
  const { isSignedIn } = useAuth();
  const { isLoaded, signIn, setActive } = useSignIn();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [code, setCode] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [codeSent, setCodeSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const [resendSuccess, setResendSuccess] = useState(false);

  useEffect(() => {
    if (isLoaded && isSignedIn) router.replace("/dashboard");
  }, [isLoaded, isSignedIn, router]);

  // Cooldown timer for resend
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const t = setInterval(() => setResendCooldown((c) => (c <= 1 ? 0 : c - 1)), 1000);
    return () => clearInterval(t);
  }, [resendCooldown]);

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!isLoaded || !signIn) return;
    setLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email,
      });
      setCodeSent(true);
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, "Something went wrong."));
    } finally {
      setLoading(false);
    }
  };

  const handleResendCode = useCallback(async () => {
    if (!isLoaded || !signIn || !email.trim() || resendCooldown > 0 || resendLoading) return;
    setError("");
    setResendSuccess(false);
    setResendLoading(true);
    try {
      await signIn.create({
        strategy: "reset_password_email_code",
        identifier: email.trim(),
      });
      setResendCooldown(RESEND_COOLDOWN_SEC);
      setResendSuccess(true);
    } catch (err: unknown) {
      setError(getClerkErrorMessage(err, "Could not send a new code. Please try again."));
    } finally {
      setResendLoading(false);
    }
  }, [isLoaded, signIn, email, resendCooldown, resendLoading]);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (!isLoaded || !signIn || !setActive) return;
    setLoading(true);
    try {
      const result = await signIn.attemptFirstFactor({
        strategy: "reset_password_email_code",
        code,
        password,
      });
      if (result.status === "complete" && result.createdSessionId) {
        await setActive({ session: result.createdSessionId });
        router.push("/dashboard");
      } else if (result.status === "needs_second_factor") {
        setError("Two-factor authentication is required. Please sign in with your password and complete 2FA.");
      } else {
        setError("Could not reset password. Please try again.");
      }
    } catch (err: unknown) {
      setError(
        getClerkErrorMessage(err, "The code is incorrect or has expired. Please try again or request a new code.")
      );
    } finally {
      setLoading(false);
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex min-h-svh w-full items-center justify-center bg-black">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-black px-4 py-12">
      <div className="w-full max-w-[400px] rounded-none border border-white/10 bg-[#1a1a1a] px-8 py-10 shadow-xl">
        <h1 className="text-center text-2xl font-bold tracking-tight text-white">
          Forgot password?
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          {codeSent
            ? "Enter the code we sent to your email and choose a new password."
            : "Enter your email and we’ll send you a code to reset your password."}
        </p>

        {!codeSent ? (
          <form onSubmit={handleSendCode} className="mt-6 flex flex-col gap-4">
            <Input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-11 rounded-none border-white/10 bg-[#2b2b2b] text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
            />
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-none bg-emerald-500 font-medium text-white hover:bg-emerald-600"
            >
              {loading ? "Sending…" : "Send reset code"}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleReset} className="mt-6 flex flex-col gap-4">
            <Input
              type="text"
              placeholder="Verification code"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="h-11 rounded-none border-white/10 bg-[#2b2b2b] text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
              autoComplete="one-time-code"
            />
            <div className="flex flex-col gap-1">
              <button
                type="button"
                onClick={handleResendCode}
                disabled={resendLoading || resendCooldown > 0}
                className="text-sm text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline disabled:pointer-events-none disabled:opacity-60"
              >
                {resendCooldown > 0
                  ? `Resend code in ${resendCooldown}s`
                  : resendLoading
                    ? "Sending…"
                    : "Resend code"}
              </button>
              {resendSuccess && (
                <p className="text-sm text-emerald-400">New code sent. Check your email.</p>
              )}
            </div>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="New password"
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
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                placeholder="Confirm new password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="h-11 rounded-none border-white/10 bg-[#2b2b2b] pr-10 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
              </button>
            </div>
            {error && <p className="text-sm text-red-400">{error}</p>}
            <Button
              type="submit"
              disabled={loading}
              className="h-11 w-full rounded-none bg-emerald-500 font-medium text-white hover:bg-emerald-600"
            >
              {loading ? "Resetting…" : "Reset password"}
            </Button>
            <button
              type="button"
              onClick={() => setCodeSent(false)}
              className="text-sm text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline"
            >
              Use a different email
            </button>
          </form>
        )}

        <p className="mt-6 text-center text-sm text-zinc-400">
          Remember your password?{" "}
          <Link href="/login" className="font-medium text-white underline-offset-2 hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
