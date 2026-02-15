/**
 * Centralized landing theme store — single source of truth for:
 * - Theme IDs (matches schema)
 * - UI metadata (label, description, icon) for create/edit flow
 * - Style config (wrapper, CTA, content block, etc.) for scan page and previews
 *
 * Import from here everywhere; do not duplicate theme data elsewhere.
 */

import type { LandingThemeDb } from "@/lib/db/schemas/qr";
import { Layout, Minimize2, Square, Maximize2 } from "lucide-react";
import type { LucideIcon } from "lucide-react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type LandingThemeConfig = {
  wrapper: string;
  inner: string;
  container: string;
  scannedLabel: string;
  title: string;
  iconWrapper: string;
  contentBlock: string;
  contentTitle?: string;
  cta: string;
  ctaSecondary: string;
  footer: string;
  showHeaderIcon: boolean;
};

export type LandingThemeOption = {
  id: LandingThemeDb;
  label: string;
  description: string;
  icon: LucideIcon;
  config: LandingThemeConfig;
};

// ---------------------------------------------------------------------------
// Scan page style config (used by QRScanLanding)
// ---------------------------------------------------------------------------

const SCAN_PAGE_CONFIG: Record<LandingThemeDb, LandingThemeConfig> = {
  default: {
    wrapper:
      "min-h-svh bg-linear-to-b from-zinc-950 via-zinc-950 to-black text-zinc-50",
    inner: "px-5 py-10 sm:py-16",
    container: "w-full max-w-md mx-auto flex flex-col gap-6",
    scannedLabel:
      "text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80",
    title:
      "text-2xl sm:text-3xl font-semibold text-white tracking-tight",
    iconWrapper:
      "flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 mb-3",
    contentBlock:
      "rounded-2xl border border-white/10 bg-zinc-900/80 backdrop-blur-md shadow-[0_18px_60px_rgba(0,0,0,0.75)] px-5 py-4 sm:px-6 sm:py-5",
    contentTitle: "text-zinc-50",
    cta:
      "rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-medium shadow-lg shadow-emerald-500/30 transition-all active:scale-[0.98] min-h-12 px-5 py-3 flex items-center justify-center gap-3 text-sm sm:text-base",
    ctaSecondary:
      "rounded-xl border border-white/15 bg-zinc-900/80 text-zinc-200 hover:bg-zinc-800/80 transition-all min-h-11 px-5 py-3 flex items-center justify-center gap-3 text-sm",
    footer:
      "py-4 text-center border-t border-white/10 text-xs text-zinc-500",
    showHeaderIcon: true,
  },
  minimal: {
    wrapper: "min-h-svh bg-slate-50 text-slate-900",
    inner: "px-5 py-10 sm:py-16",
    container:
      "w-full max-w-lg mx-auto flex flex-col gap-5 text-left rounded-2xl border border-slate-200 bg-white/90 px-5 py-5 sm:px-6 sm:py-6 shadow-sm",
    scannedLabel:
      "text-[10px] font-medium uppercase tracking-[0.28em] text-slate-400 border-b border-dashed border-slate-200 pb-2 w-full text-left",
    title:
      "mt-2 text-xl sm:text-2xl font-semibold text-slate-900 tracking-tight text-left",
    iconWrapper: "hidden",
    contentBlock:
      "mt-2 border-l border-slate-200 bg-transparent pl-4 py-3 text-sm text-slate-600 leading-relaxed",
    contentTitle: "text-slate-900",
    cta:
      "mt-2 rounded-full border border-slate-900 bg-slate-900 text-slate-50 font-medium hover:bg-slate-800 transition-colors min-h-11 px-4 py-2.5 flex items-center justify-between gap-3 w-full text-sm",
    ctaSecondary:
      "rounded-full border border-slate-200 bg-transparent text-slate-600 hover:bg-slate-50/80 font-medium min-h-11 px-4 py-2.5 flex items-center justify-between gap-3 w-full text-sm",
    footer:
      "py-6 text-center text-[11px] text-slate-400 tracking-wide",
    showHeaderIcon: false,
  },
  card: {
    wrapper:
      "min-h-svh bg-linear-to-b from-zinc-950 via-zinc-900 to-black text-zinc-50",
    inner: "px-5 py-10 sm:py-16 sm:px-6",
    container: "w-full max-w-md mx-auto flex flex-col gap-7",
    scannedLabel:
      "text-xs font-semibold uppercase tracking-[0.25em] text-emerald-300/90",
    title:
      "text-2xl sm:text-3xl font-semibold text-white tracking-tight leading-tight",
    iconWrapper:
      "flex size-14 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 mb-3",
    contentBlock:
      "rounded-3xl border border-white/10 bg-zinc-950/90 shadow-[0_22px_70px_rgba(0,0,0,0.85)] px-6 py-5 sm:px-7 sm:py-6 text-zinc-200 leading-relaxed",
    contentTitle: "text-zinc-50",
    cta:
      "rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold shadow-lg shadow-emerald-500/40 transition-all active:scale-[0.98] min-h-14 px-6 py-4 flex items-center justify-center gap-3 text-base",
    ctaSecondary:
      "rounded-full border border-emerald-400/60 bg-transparent text-emerald-200 hover:bg-emerald-500/10 transition-all min-h-12 px-5 py-3 flex items-center justify-center gap-3 text-sm",
    footer:
      "py-5 text-center text-xs text-zinc-500 tracking-wide",
    showHeaderIcon: true,
  },
  full: {
    wrapper:
      "min-h-svh bg-linear-to-b from-emerald-500/20 via-zinc-950 to-black relative overflow-hidden text-zinc-50",
    inner: "relative z-10 px-4 py-14 sm:py-24",
    container: "w-full max-w-md mx-auto flex flex-col gap-8 text-center",
    scannedLabel:
      "text-xs font-semibold uppercase tracking-[0.3em] text-emerald-200/90",
    title:
      "text-3xl sm:text-4xl font-bold text-white tracking-tight",
    iconWrapper:
      "flex size-16 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm text-white border border-white/25 mb-4",
    contentBlock:
      "rounded-2xl border border-white/15 bg-white/5 backdrop-blur-xl shadow-[0_26px_90px_rgba(0,0,0,0.9)] p-6 sm:p-8 text-left text-white/95",
    contentTitle: "text-white",
    cta:
      "rounded-2xl bg-white text-zinc-950 hover:bg-zinc-100 font-bold shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] min-h-16 px-8 py-4 flex items-center justify-center gap-4 text-lg",
    ctaSecondary:
      "rounded-2xl border-2 border-white/40 bg-transparent text-white font-semibold backdrop-blur-sm hover:bg-white/10 transition-all min-h-14 px-6 py-4 flex items-center justify-center gap-3",
    footer:
      "py-6 text-center text-xs text-emerald-100/80",
    showHeaderIcon: true,
  },
};

// ---------------------------------------------------------------------------
// Single theme registry (UI + config)
// ---------------------------------------------------------------------------

export const LANDING_THEMES: LandingThemeOption[] = [
  {
    id: "default",
    label: "Classic",
    description: "Clean slate gradient, emerald CTA, soft card",
    icon: Layout,
    config: SCAN_PAGE_CONFIG.default,
  },
  {
    id: "minimal",
    label: "Minimal",
    description: "Editorial look, borders only, no shadows",
    icon: Minimize2,
    config: SCAN_PAGE_CONFIG.minimal,
  },
  {
    id: "card",
    label: "Card",
    description: "Warm amber accent, single prominent card",
    icon: Square,
    config: SCAN_PAGE_CONFIG.card,
  },
  {
    id: "full",
    label: "Hero",
    description: "Bold indigo gradient, large type, dot grid",
    icon: Maximize2,
    config: SCAN_PAGE_CONFIG.full,
  },
];

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

export const DEFAULT_LANDING_THEME: LandingThemeDb = "default";

/** Style config for the scan page (QRScanLanding). */
export const LANDING_THEME_CONFIG: Record<LandingThemeDb, LandingThemeConfig> =
  SCAN_PAGE_CONFIG;

export function getThemeById(id: LandingThemeDb): LandingThemeOption | undefined {
  return LANDING_THEMES.find((t) => t.id === id);
}

export function getThemeConfig(id: LandingThemeDb): LandingThemeConfig {
  return LANDING_THEME_CONFIG[id] ?? LANDING_THEME_CONFIG.default;
}
