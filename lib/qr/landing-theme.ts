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
      "min-h-svh bg-linear-to-b from-slate-50 to-slate-100/80 dark:from-slate-950 dark:to-slate-900/90",
    inner: "px-4 py-10 sm:py-14",
    container: "w-full max-w-sm mx-auto flex flex-col gap-6",
    scannedLabel:
      "text-[11px] font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400",
    title: "text-xl font-semibold text-slate-900 dark:text-slate-50 tracking-tight",
    iconWrapper:
      "flex size-12 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 mb-2",
    contentBlock:
      "rounded-2xl border border-slate-200/80 dark:border-slate-700/80 bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm shadow-sm p-5",
    cta: "rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-medium shadow-md hover:shadow-lg transition-all active:scale-[0.98] min-h-12 px-5 py-3 flex items-center justify-center gap-3",
    ctaSecondary:
      "rounded-xl border-2 border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all min-h-12 px-5 py-3 flex items-center justify-center gap-3",
    footer:
      "py-4 text-center border-t border-slate-200/50 dark:border-slate-700/50",
    showHeaderIcon: true,
  },
  minimal: {
    wrapper: "min-h-svh bg-white dark:bg-slate-950",
    inner: "px-5 py-12 sm:py-16",
    container: "w-full max-w-xs mx-auto flex flex-col gap-6 text-left",
    scannedLabel:
      "text-[10px] font-medium uppercase tracking-widest text-slate-400 dark:text-slate-500 border-b border-slate-200 dark:border-slate-800 pb-2 w-fit",
    title: "text-lg font-medium text-slate-900 dark:text-slate-100 tracking-tight",
    iconWrapper: "hidden",
    contentBlock:
      "rounded-none border-b border-slate-200 dark:border-slate-800 bg-transparent py-4 text-sm text-slate-600 dark:text-slate-300 leading-relaxed",
    cta: "rounded-none border-b-2 border-slate-900 dark:border-slate-100 bg-transparent text-slate-900 dark:text-slate-100 font-medium hover:bg-slate-50 dark:hover:bg-slate-900/50 transition-colors min-h-14 px-0 py-4 flex items-center justify-center gap-3 w-full",
    ctaSecondary:
      "rounded-none border-b border-slate-200 dark:border-slate-800 bg-transparent text-slate-600 dark:text-slate-400 font-medium min-h-12 px-0 py-3 flex items-center justify-center gap-3",
    footer:
      "py-6 text-center text-[11px] text-slate-400 dark:text-slate-500 tracking-wide",
    showHeaderIcon: false,
  },
  card: {
    wrapper:
      "min-h-svh bg-linear-to-br from-amber-50/60 via-orange-50/40 to-slate-100/80 dark:from-slate-900 dark:via-slate-900 dark:to-slate-950",
    inner: "px-5 py-10 sm:py-14 sm:px-6",
    container: "w-full max-w-sm mx-auto flex flex-col gap-7",
    scannedLabel:
      "text-xs font-semibold uppercase tracking-[0.18em] text-amber-700/90 dark:text-amber-400/90",
    title: "text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-50 tracking-tight leading-tight",
    iconWrapper:
      "flex size-14 items-center justify-center rounded-2xl bg-amber-500/20 dark:bg-amber-400/20 text-amber-700 dark:text-amber-300 mb-3",
    contentBlock:
      "rounded-2xl border-2 border-amber-200/80 dark:border-amber-800/60 bg-white dark:bg-slate-800 shadow-xl shadow-amber-900/5 dark:shadow-black/20 p-6 sm:p-8 text-slate-700 dark:text-slate-200 leading-relaxed",
    cta: "rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-semibold shadow-lg shadow-amber-500/25 hover:shadow-amber-500/30 transition-all active:scale-[0.98] min-h-14 px-6 py-4 flex items-center justify-center gap-3 text-base",
    ctaSecondary:
      "rounded-xl border-2 border-amber-300 dark:border-amber-600 bg-amber-50/50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-200 font-medium min-h-12 px-5 py-3 flex items-center justify-center gap-3",
    footer:
      "py-5 text-center text-xs text-slate-500 dark:text-slate-400 tracking-wide",
    showHeaderIcon: true,
  },
  full: {
    wrapper:
      "min-h-svh bg-linear-to-b from-indigo-600 via-indigo-700 to-indigo-900 dark:from-indigo-950 dark:via-indigo-900 dark:to-slate-950 relative overflow-hidden",
    inner: "relative z-10 px-4 py-14 sm:py-24",
    container: "w-full max-w-md mx-auto flex flex-col gap-8 text-center",
    scannedLabel:
      "text-xs font-semibold uppercase tracking-[0.25em] text-indigo-200 dark:text-indigo-300/90",
    title: "text-3xl sm:text-4xl font-bold text-white tracking-tight",
    iconWrapper:
      "flex size-16 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm text-white border border-white/20 mb-4",
    contentBlock:
      "rounded-2xl border border-white/20 bg-white/10 dark:bg-white/5 backdrop-blur-md shadow-2xl p-6 sm:p-8 text-left text-white/95",
    cta: "rounded-2xl bg-white text-indigo-700 hover:bg-indigo-50 font-bold shadow-xl hover:shadow-2xl transition-all active:scale-[0.98] min-h-16 px-8 py-4 flex items-center justify-center gap-4 text-lg",
    ctaSecondary:
      "rounded-2xl border-2 border-white/40 bg-white/10 text-white font-semibold backdrop-blur-sm hover:bg-white/20 transition-all min-h-14 px-6 py-4 flex items-center justify-center gap-3",
    footer:
      "py-6 text-center text-xs text-indigo-200/80 dark:text-indigo-300/70",
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
