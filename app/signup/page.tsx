"use client";

import { useState } from "react";
import Link from "next/link";
import { Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="flex min-h-svh w-full flex-col items-center justify-center bg-black px-4 py-12">
      {/* Main boxy container */}
      <div className="w-full max-w-[400px] rounded-none border border-white/10 bg-[#1a1a1a] px-8 py-10 shadow-xl">
        <h1 className="text-center text-2xl font-bold tracking-tight text-white">
          Sign up
        </h1>
        <p className="mt-2 text-center text-sm text-zinc-400">
          Get <span className="font-medium text-emerald-400">2 free QR codes</span> when you join—no card required.
        </p>

        {/* Google signup — only social option */}
        <div className="mt-8 flex flex-col gap-3">
          <Button
            type="button"
            variant="outline"
            className="h-11 w-full rounded-none border-white/20 bg-[#f3f4f6] text-black hover:bg-[#e5e7eb] dark:border-white/20 dark:bg-[#f3f4f6] dark:text-black dark:hover:bg-[#e5e7eb]"
            asChild
          >
            <Link href="#" className="flex items-center justify-center gap-3">
              <GoogleIcon className="size-5 shrink-0" />
              <span>Continue with Google</span>
            </Link>
          </Button>
        </div>

        {/* Divider */}
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

        {/* Email, Password, Confirm Password */}
        <form className="flex flex-col gap-4">
          <Input
            type="email"
            placeholder="Email"
            className="h-11 rounded-none border-white/10 bg-[#2b2b2b] text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
          />
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              className="h-11 rounded-none border-white/10 bg-[#2b2b2b] pr-10 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <div className="relative">
            <Input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm password"
              className="h-11 rounded-none border-white/10 bg-[#2b2b2b] pr-10 text-white placeholder:text-zinc-500 focus-visible:ring-emerald-500/50"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((p) => !p)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 transition-colors hover:text-zinc-300"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <EyeOff className="size-4" />
              ) : (
                <Eye className="size-4" />
              )}
            </button>
          </div>
          <Button
            type="submit"
            className="h-11 w-full rounded-none bg-emerald-500 font-medium text-white hover:bg-emerald-600"
          >
            Sign up
          </Button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="font-medium text-white underline-offset-2 hover:underline"
          >
            Log in
          </Link>
        </p>
      </div>

      {/* Legal text — outside box, at bottom */}
      <p className="mt-10 max-w-[400px] text-center text-xs text-zinc-500">
        By continuing, you are agreeing to UseQR&apos;s{" "}
        <Link
          href="#"
          className="font-medium text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          Terms of Service
        </Link>{" "}
        and{" "}
        <Link
          href="#"
          className="font-medium text-zinc-400 underline-offset-2 hover:text-zinc-300 hover:underline"
        >
          Privacy Policy
        </Link>
        .
      </p>
    </div>
  );
}
