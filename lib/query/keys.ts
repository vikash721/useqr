// ---------------------------------------------------------------------------
// Centralised query-key factory
// ---------------------------------------------------------------------------
// Every useQuery / invalidateQueries call MUST reference these keys so the
// cache stays consistent across all pages.
// ---------------------------------------------------------------------------

export const qrKeys = {
    /** Root key – invalidating this invalidates *everything* QR-related. */
    all: ["qrs"] as const,

    /* ── List ─────────────────────────────────────────────────────────────── */
    lists: () => [...qrKeys.all, "list"] as const,
    list: (params: { limit: number; skip: number }) =>
        [...qrKeys.lists(), params] as const,

    /* ── Detail ───────────────────────────────────────────────────────────── */
    details: () => [...qrKeys.all, "detail"] as const,
    detail: (id: string) => [...qrKeys.details(), id] as const,

    /* ── Analytics ────────────────────────────────────────────────────────── */
    analytics: () => [...qrKeys.all, "analytics"] as const,
    analytic: (id: string) => [...qrKeys.analytics(), id] as const,
};
