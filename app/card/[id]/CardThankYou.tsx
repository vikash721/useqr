"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Laptop } from "lucide-react";
import { api } from "@/lib/axios";

type Props = { qrId: string };

export default function CardThankYou({ qrId }: Props) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    api
      .post("/api/scan", { qrId })
      .then(() => setDone(true))
      .catch(() => setError(true));
  }, [qrId]);

  if (error) {
    return (
      <div className="flex min-h-svh min-w-full items-center justify-center bg-black px-4">
        <p className="text-center text-zinc-500">Something went wrong.</p>
      </div>
    );
  }

  if (!done) {
    return (
      <div className="flex min-h-svh min-w-full items-center justify-center bg-black px-4">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-amber-500/30 border-t-amber-400" />
          <p className="text-sm uppercase tracking-[0.3em] text-zinc-500">Sending signal…</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-svh min-w-full flex-col items-center justify-center overflow-hidden bg-black px-6 text-center">
      {/* Subtle radial glow */}
      <div
        className="pointer-events-none absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 50%, rgba(245, 158, 11, 0.12) 0%, transparent 60%)",
        }}
        aria-hidden
      />
      <div className="relative flex flex-col items-center gap-8">
        <div className="flex size-20 items-center justify-center rounded-2xl border border-amber-500/30 bg-amber-500/10 text-amber-400/90 sm:size-24">
          <Laptop className="size-10 sm:size-12" aria-hidden />
        </div>
        <h1 className="max-w-lg text-3xl font-bold tracking-tight text-white sm:text-4xl md:text-5xl">
          Look at the other screen.
        </h1>
        <p className="max-w-sm text-lg text-zinc-400 sm:text-xl">
          <span className="font-semibold text-amber-400/90">Mission passed.</span>{" "}
          Check the screen where you had this open.
        </p>
        <p className="mt-2 text-sm uppercase tracking-[0.25em] text-zinc-500">
          You&apos;re in.
        </p>
        {/* UseQR branding — click to go home */}
        <Link
          href="/"
          className="mt-12 flex items-center gap-2 border-t border-white/10 pt-8 transition-opacity hover:opacity-90"
        >
          <img
            src="/logo/svg/logo.svg"
            alt=""
            className="h-5 w-5 shrink-0 opacity-90"
          />
          <span className="text-lg font-semibold tracking-tight text-white">
            Use<span className="font-bold text-emerald-400">QR</span>
          </span>
        </Link>
      </div>
    </div>
  );
}
