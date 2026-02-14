"use client";

import { usePathname } from "next/navigation";

/**
 * Paths (or path prefixes) where the sidebar SHOULD be shown.
 * This is an allow-list. Any path NOT in this list (including 404s and new public pages) will hide the sidebar by default.
 */
export const PATHS_WITH_SIDEBAR: string[] = [
  "/dashboard",
  "/manage-users",
];

function checkPathVisible(pathname: string | null): boolean {
  if (!pathname) return false;

  const normalized = pathname.replace(/\/$/, "") || "/";

  return PATHS_WITH_SIDEBAR.some((path) => {
    const normalizedPath = path.replace(/\/$/, "") || "/";
    return normalized === normalizedPath || normalized.startsWith(`${normalizedPath}/`);
  });
}

/**
 * Returns whether the sidebar should be shown on the current route.
 * Pathname is read inside this hook; relies on PATHS_WITH_SIDEBAR allow-list.
 */
export function useShouldShowSidebar(): boolean {
  const pathname = usePathname();
  return checkPathVisible(pathname);
}

/**
 * Returns whether the header should be shown on the current route.
 * Uses the same logic as sidebar (PATHS_WITHOUT_SIDEBAR) — when sidebar is hidden, header is hidden too.
 */
export function useShouldShowHeader(): boolean {
  return useShouldShowSidebar();
}
