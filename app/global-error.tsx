
"use client";

import Link from "next/link";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en">
      <body className="flex h-screen w-full flex-col items-center justify-center bg-black text-white px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight text-white mb-2">500</h1>
        <h2 className="text-xl font-medium text-zinc-400 mb-6">Server Error</h2>
        
        <p className="max-w-md text-zinc-500 mb-8">
            An unexpected error occurred.
        </p>

        <div className="flex gap-4">
          <button
             onClick={() => reset()}
             className="inline-flex h-9 items-center justify-center rounded-none bg-emerald-500 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
          >
            Try Again
          </button>
           <Link
            href="/"
             className="inline-flex h-9 items-center justify-center rounded-none border border-white/10 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
           >
            Go Home
          </Link>
        </div>

        {error.digest && (
              <p className="mt-8 text-[10px] font-mono text-zinc-800">
                Ref: {error.digest}
              </p>
        )}
      </body>
    </html>
  );
}
