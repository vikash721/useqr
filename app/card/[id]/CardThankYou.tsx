"use client";

import { useEffect, useState } from "react";
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
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <p className="text-center text-zinc-400">Something went wrong.</p>
      </div>
    );
  }

  if (!done) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-4">
        <div className="h-8 w-8 animate-pulse rounded-full border-2 border-emerald-500/30 border-t-emerald-400" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-zinc-950 px-4 text-center">
      <h1 className="text-2xl font-semibold text-white sm:text-3xl">
        Thank you
      </h1>
      <p className="mt-2 text-zinc-400">Thanks for scanning.</p>
    </div>
  );
}
