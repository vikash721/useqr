
"use client";

import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-black text-white px-4 text-center">
      <h1 className="text-4xl font-bold tracking-tight text-white mb-2">404</h1>
      <h2 className="text-xl font-medium text-zinc-400 mb-6">Page Not Found</h2>
      
      <p className="max-w-md text-zinc-500 mb-8">
        The page you are looking for doesn't exist or has been moved.
      </p>

      <div className="flex gap-4">
        <Link
          href="/"
          className="inline-flex h-9 items-center justify-center rounded-none bg-emerald-500 px-6 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
        >
          Go Home
        </Link>
        <Link
            href="/contact"
            className="inline-flex h-9 items-center justify-center rounded-none border border-white/10 bg-white/5 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
        >
            Contact
        </Link>
      </div>
      
       <div className="absolute bottom-8 text-xs text-zinc-700">
         UseQR &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
}
