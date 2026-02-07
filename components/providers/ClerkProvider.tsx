"use client";

import { ClerkProvider as Clerk } from "@clerk/nextjs";

/**
 * Minimal Clerk wrapper. Use only for session/auth; all UI is custom.
 */
export function ClerkProvider({ children }: { children: React.ReactNode }) {
  return <Clerk>{children}</Clerk>;
}
