"use client";

import type { LandingThemeDb } from "@/lib/db/schemas/qr";
import type { QRContentTypeDb } from "@/lib/db/schemas/qr";
import { getQRTypeLabel } from "@/lib/qr/qr-types";
import { Phone, Mail, MessageSquare, MessageCircle, User, FileText, Link2, Wifi, MapPin, Calendar, Smartphone } from "lucide-react";
import { cn } from "@/lib/utils";

const ACTION_TYPES = ["phone", "email", "sms", "whatsapp"] as const;
function isActionType(type: string | null): type is (typeof ACTION_TYPES)[number] {
  return type !== null && ACTION_TYPES.includes(type as (typeof ACTION_TYPES)[number]);
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  url: Link2,
  smart_redirect: Smartphone,
  vcard: User,
  text: FileText,
  wifi: Wifi,
  location: MapPin,
  event: Calendar,
};

function getPreviewTypeLabel(contentType: QRContentTypeDb | null | undefined): string {
  if (!contentType) return "Call";
  return getQRTypeLabel(contentType);
}

function getPreviewCtaLabel(contentType: QRContentTypeDb | null | undefined): string {
  if (!contentType) return "Call now";
  if (contentType === "phone") return "Call now";
  if (contentType === "email") return "Send email";
  if (contentType === "sms") return "Send SMS";
  if (contentType === "whatsapp") return "Open WhatsApp";
  return "Open";
}

type ThemeStyle = {
  wrapper: string;
  inner: string;
  container: string;
  scannedLabel: string;
  title: string;
  iconWrapper: string;
  contentBlock: string;
  cta: string;
  showIcon: boolean;
};

/** Small card preview - mirrors full theme designs in miniature. */
const PREVIEW_THEME_STYLES: Record<LandingThemeDb, ThemeStyle> = {
  default: {
    wrapper:
      "bg-linear-to-b from-zinc-950 via-zinc-950 to-black rounded-lg",
    inner: "p-2",
    container: "flex flex-col gap-1.5 max-w-[110px] mx-auto",
    scannedLabel:
      "text-[7px] font-semibold uppercase tracking-widest text-emerald-400/80",
    title: "text-[9px] font-semibold text-zinc-50",
    iconWrapper:
      "flex size-5 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 mb-1",
    contentBlock:
      "rounded-lg border border-white/10 bg-zinc-900/80 p-1.5",
    cta:
      "rounded-md bg-emerald-500 text-black text-[8px] font-medium px-2 py-1 flex items-center justify-center gap-1",
    showIcon: true,
  },
  minimal: {
    wrapper:
      "bg-slate-50 rounded-lg border border-slate-200",
    inner: "p-1.5",
    container: "flex flex-col gap-1 max-w-[100px] text-left",
    scannedLabel:
      "text-[6px] font-medium uppercase tracking-widest text-slate-500 border-b border-dashed border-slate-200 pb-1 w-full",
    title: "mt-0.5 text-[8px] font-medium text-slate-900",
    iconWrapper: "hidden",
    contentBlock:
      "border-l border-slate-200 py-1.5 pl-1.5 text-[7px] text-slate-600",
    cta:
      "border-b border-slate-900 text-[8px] font-medium py-2 flex items-center justify-between",
    showIcon: false,
  },
  card: {
    wrapper:
      "bg-linear-to-b from-zinc-950 via-zinc-900 to-black rounded-lg",
    inner: "p-2",
    container: "flex flex-col gap-1.5 max-w-[110px] mx-auto",
    scannedLabel:
      "text-[6px] font-semibold uppercase text-emerald-300/90",
    title: "text-[9px] font-bold text-zinc-50",
    iconWrapper:
      "flex size-6 items-center justify-center rounded-lg bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 mb-1",
    contentBlock:
      "rounded-lg border border-white/10 bg-zinc-950/90 shadow-md p-2",
    cta:
      "rounded-md bg-emerald-500 text-black text-[8px] font-semibold px-2 py-1.5 flex items-center justify-center",
    showIcon: true,
  },
  full: {
    wrapper:
      "bg-linear-to-b from-emerald-500/20 via-zinc-950 to-black rounded-lg relative overflow-hidden",
    inner: "p-2 relative z-10",
    container: "flex flex-col gap-1.5 max-w-[110px] mx-auto text-center",
    scannedLabel:
      "text-[6px] font-semibold uppercase tracking-widest text-emerald-100/90",
    title: "text-[9px] font-bold text-white",
    iconWrapper:
      "flex size-6 items-center justify-center rounded-lg bg-white/10 text-white border border-white/30 mb-1",
    contentBlock:
      "rounded-lg border border-white/15 bg-white/5 text-[7px] text-white/95 p-2",
    cta:
      "rounded-lg bg-white text-zinc-950 text-[8px] font-bold px-2 py-1.5 flex items-center justify-center",
    showIcon: true,
  },
};

/** Popup (larger) preview - same themes, readable size. */
const POPUP_THEME_STYLES: Record<LandingThemeDb, ThemeStyle> = {
  default: {
    wrapper:
      "bg-linear-to-b from-zinc-950 via-zinc-950 to-black rounded-2xl min-h-[340px]",
    inner: "p-5",
    container: "flex flex-col gap-4 max-w-[220px] mx-auto",
    scannedLabel:
      "text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-400/80",
    title: "text-base font-semibold text-zinc-50",
    iconWrapper:
      "flex size-10 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 mb-2",
    contentBlock:
      "rounded-xl border border-white/10 bg-zinc-900/80 p-3 text-xs text-zinc-200",
    cta:
      "rounded-xl bg-emerald-500 text-black text-sm font-medium px-4 py-3 flex items-center justify-center gap-2",
    showIcon: true,
  },
  minimal: {
    wrapper:
      "bg-slate-50 rounded-2xl border border-slate-200 min-h-[340px]",
    inner: "p-4",
    container: "flex flex-col gap-3 max-w-[200px] text-left",
    scannedLabel:
      "text-[9px] font-medium uppercase tracking-widest text-slate-500 border-b border-dashed border-slate-200 pb-2 w-full",
    title: "mt-2 text-base font-medium text-slate-900",
    iconWrapper: "hidden",
    contentBlock:
      "border-l border-slate-200 py-3 pl-3 text-xs text-slate-600",
    cta:
      "border-b border-slate-900 text-sm font-medium py-4 flex items-center justify-between gap-2",
    showIcon: false,
  },
  card: {
    wrapper:
      "bg-linear-to-b from-zinc-950 via-zinc-900 to-black rounded-2xl min-h-[340px]",
    inner: "p-5",
    container: "flex flex-col gap-4 max-w-[220px] mx-auto",
    scannedLabel:
      "text-[9px] font-semibold uppercase text-emerald-300/90",
    title: "text-lg font-bold text-zinc-50",
    iconWrapper:
      "flex size-12 items-center justify-center rounded-xl bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 mb-2",
    contentBlock:
      "rounded-xl border border-white/10 bg-zinc-950/90 shadow-lg p-4 text-xs text-zinc-200",
    cta:
      "rounded-xl bg-emerald-500 text-black text-sm font-semibold px-5 py-3 flex items-center justify-center gap-2",
    showIcon: true,
  },
  full: {
    wrapper:
      "bg-linear-to-b from-emerald-500/20 via-zinc-950 to-black rounded-2xl min-h-[360px] relative overflow-hidden",
    inner: "p-6 relative z-10",
    container: "flex flex-col gap-4 max-w-[240px] mx-auto text-center",
    scannedLabel:
      "text-[10px] font-semibold uppercase tracking-widest text-emerald-100/90",
    title: "text-xl font-bold text-white",
    iconWrapper:
      "flex size-12 items-center justify-center rounded-xl bg-white/10 text-white border border-white/30 mb-2",
    contentBlock:
      "rounded-xl border border-white/15 bg-white/5 text-xs text-white/95 p-4",
    cta:
      "rounded-xl bg-white text-zinc-950 text-sm font-bold px-6 py-3 flex items-center justify-center gap-2",
    showIcon: true,
  },
};

type LandingThemePreviewProps = {
  themeId: LandingThemeDb;
  /** When set, preview shows this QR type (label, icon, action vs content). Updates when user changes type. */
  contentType?: QRContentTypeDb | null;
  /** Override variant; if not set, derived from contentType (action for phone/email/sms/whatsapp, else content). */
  variant?: "action" | "content";
  size?: "card" | "popup";
  className?: string;
};

/**
 * Mini preview of a landing page theme — matches QRScanLanding. Updates when contentType changes.
 */
export function LandingThemePreview({
  themeId,
  contentType = null,
  variant: variantProp,
  size = "card",
  className,
}: LandingThemePreviewProps) {
  const styles = size === "popup" ? POPUP_THEME_STYLES : PREVIEW_THEME_STYLES;
  const t = styles[themeId] ?? styles.default;

  const typeLabel = getPreviewTypeLabel(contentType);
  const variant = variantProp ?? (isActionType(contentType ?? null) ? "action" : "content");
  const ctaLabel = getPreviewCtaLabel(contentType);
  const IconComponent = (contentType && TYPE_ICONS[contentType]) ? TYPE_ICONS[contentType] : Phone;

  return (
    <div
      className={cn(
        "overflow-hidden",
        size === "card" && "h-full w-full min-h-0",
        t.wrapper,
        className
      )}
      aria-hidden
    >
      <div
        className={cn(
          size === "card" ? "h-full flex flex-col justify-center" : "flex flex-col justify-center",
          t.inner
        )}
      >
        <div className={cn(t.container)}>
          {t.showIcon && (
            <div className={cn("flex justify-center", t.iconWrapper)}>
              <IconComponent className="size-3 sm:size-4" />
            </div>
          )}
          <p className={t.scannedLabel}>Scanned</p>
          <p className={t.title}>{typeLabel}</p>
          {variant === "action" ? (
            <div className={cn(t.cta, "gap-1.5 flex items-center justify-center")}>
              <IconComponent className="size-3 shrink-0" />
              <span>{ctaLabel}</span>
            </div>
          ) : (
            <div className={cn("text-left", t.contentBlock)}>
              <p className="text-inherit leading-snug wrap-break-word opacity-90">
                Sample content
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
