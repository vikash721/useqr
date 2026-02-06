"use client";

import { usePathname } from "next/navigation";

/**
 * Paths (or path prefixes) where the sidebar and header should be hidden.
 * Add a path here and the sidebar + header will hide on that page automatically.
 * Use exact paths like "/login" or prefixes like "/auth" to hide on nested routes (e.g. /auth/callback).
 */
export const PATHS_WITHOUT_SIDEBAR: string[] = [
  "/",
  "/about",
  "/login",
  // "/signup",
  // "/auth",
];

function checkPathHidden(pathname: string | null): boolean {
  if (!pathname) return false;

  const normalized = pathname.replace(/\/$/, "") || "/";

  return PATHS_WITHOUT_SIDEBAR.some((path) => {
    const normalizedPath = path.replace(/\/$/, "") || "/";
    return normalized === normalizedPath || normalized.startsWith(`${normalizedPath}/`);
  });
}

/**
 * Returns whether the sidebar should be shown on the current route.
 * Pathname is read inside this hook; just add paths to PATHS_WITHOUT_SIDEBAR and it works.
 */
export function useShouldShowSidebar(): boolean {
  const pathname = usePathname();
  return !checkPathHidden(pathname);
}

/**
 * Returns whether the header should be shown on the current route.
 * Uses the same logic as sidebar (PATHS_WITHOUT_SIDEBAR) — when sidebar is hidden, header is hidden too.
 */
export function useShouldShowHeader(): boolean {
  return useShouldShowSidebar();
}
