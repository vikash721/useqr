"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Link2,
  ExternalLink,
  User,
  Wifi,
  Calendar,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { QRAction, QRTypeResolution } from "@/lib/qr/qr-types";
import { getQRTypeLabel } from "@/lib/qr/qr-types";
import type { QRContentTypeDb } from "@/lib/db/schemas/qr";
import type { LandingThemeDb } from "@/lib/db/schemas/qr";
import { LANDING_THEME_CONFIG } from "@/lib/qr/landing-theme";
import { cn } from "@/lib/utils";

type QRScanLandingProps = {
  resolution: QRTypeResolution & { behavior: "landing" };
  contentType: QRContentTypeDb;
  /** Landing page theme (default, minimal, card, full). */
  landingTheme?: LandingThemeDb;
};

/** Structured display for vcard/wifi/event when resolution.structured is set */
function StructuredContentBlock({
  contentType,
  structured,
  config,
}: {
  contentType: QRContentTypeDb;
  structured: unknown;
  config: { contentBlock: string; contentTitle?: string };
}) {
  if (contentType === "vcard" && structured && typeof structured === "object" && "firstName" in structured) {
    const v = structured as { firstName?: string; lastName?: string; organization?: string; phone?: string; email?: string };
    const name = [v.firstName, v.lastName].filter(Boolean).join(" ").trim();
    return (
      <div className={cn("overflow-hidden text-left space-y-1", config.contentBlock)}>
        {name && (
          <p className={cn("font-semibold", config.contentTitle ?? "text-foreground")}>
            {name}
          </p>
        )}
        {v.organization && <p className="text-sm text-muted-foreground">{v.organization}</p>}
        {v.phone && <p className="text-sm">{v.phone}</p>}
        {v.email && <p className="text-sm">{v.email}</p>}
      </div>
    );
  }
  if (contentType === "wifi" && structured && typeof structured === "object" && "ssid" in structured) {
    const w = structured as { ssid: string; password?: string };
    return (
      <div className={cn("overflow-hidden text-left space-y-1", config.contentBlock)}>
        <p className="text-sm"><span className="text-muted-foreground">Network:</span> {w.ssid}</p>
        {w.password != null && w.password !== "" && (
          <p className="text-sm"><span className="text-muted-foreground">Password:</span> {w.password}</p>
        )}
      </div>
    );
  }
  if (contentType === "event" && structured && typeof structured === "object" && "title" in structured) {
    const e = structured as { title: string; start?: string; end?: string; location?: string; description?: string };
    const formatDate = (iso: string) => {
      try {
        return new Date(iso).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" });
      } catch {
        return iso;
      }
    };
    return (
      <div className={cn("overflow-hidden text-left space-y-1", config.contentBlock)}>
        <p className={cn("font-semibold", config.contentTitle ?? "text-foreground")}>
          {e.title}
        </p>
        {e.start && <p className="text-sm text-muted-foreground">Start: {formatDate(e.start)}</p>}
        {e.end && <p className="text-sm text-muted-foreground">End: {formatDate(e.end)}</p>}
        {e.location && <p className="text-sm">{e.location}</p>}
        {e.description && <p className="text-sm text-muted-foreground">{e.description}</p>}
      </div>
    );
  }
  return null;
}

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  url: Link2,
  vcard: User,
  wifi: Wifi,
  event: Calendar,
  default: ExternalLink,
};

function getActionIcon(contentType: QRContentTypeDb) {
  return ACTION_ICONS[contentType] ?? ACTION_ICONS.default;
}

/** Icon for a specific action (e.g. Phone for tel:, Mail for mailto:) when applicable. */
function getActionIconForHref(href: string, contentType: QRContentTypeDb) {
  if (href.startsWith("tel:")) return Phone;
  if (href.startsWith("mailto:")) return Mail;
  if (href.startsWith("sms:")) return MessageSquare;
  if (href.includes("wa.me/") || href.startsWith("https://wa.me")) return MessageCircle;
  if (href.startsWith("http")) return Link2;
  return getActionIcon(contentType);
}

function ActionButton({
  action,
  contentType,
  themeId,
}: {
  action: QRAction;
  contentType: QRContentTypeDb;
  themeId: LandingThemeDb;
}) {
  const Icon = getActionIconForHref(action.href, contentType);
  const isExternal =
    action.href.startsWith("http") ||
    action.href.startsWith("tel:") ||
    action.href.startsWith("mailto:") ||
    action.href.startsWith("sms:") ||
    action.href.startsWith("data:");

  const config = LANDING_THEME_CONFIG[themeId];
  const isPrimary = action.variant === "primary";
  const buttonClass = isPrimary ? config.cta : config.ctaSecondary;

  const content = (
    <>
      <Icon className="size-5 shrink-0" />
      <span className="flex flex-col items-center gap-0.5 text-center">
        <span>{action.label}</span>
        {action.subtitle && (
          <span className="text-xs font-normal opacity-90">{action.subtitle}</span>
        )}
      </span>
    </>
  );

  if (isExternal) {
    return (
      <a
        href={action.href}
        className={cn("inline-flex w-full items-center justify-center gap-3", buttonClass)}
        target={action.href.startsWith("http") ? "_blank" : undefined}
        rel={action.href.startsWith("http") ? "noopener noreferrer" : undefined}
      >
        {content}
      </a>
    );
  }

  return (
    <Button asChild size="lg" className={cn("w-full", buttonClass)}>
      <Link href={action.href}>{content}</Link>
    </Button>
  );
}

/**
 * Renders the landing view for a scanned QR with theme-specific layout, icons, and UI.
 */
export function QRScanLanding({
  resolution,
  contentType,
  landingTheme = "default",
}: QRScanLandingProps) {
  const { actions, displayContent } = resolution;
  const typeLabel = getQRTypeLabel(contentType);
  const config = LANDING_THEME_CONFIG[landingTheme];
  const Icon = getActionIcon(contentType);

  const isFullTheme = landingTheme === "full";

  return (
    <div className={cn("flex flex-col", config.wrapper)}>
      {/* Full theme: decorative dot grid */}
      {isFullTheme && (
        <div
          className="absolute inset-0 z-0 opacity-20 bg-size-[20px_20px] bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.4)_1px,transparent_0)] dark:bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.15)_1px,transparent_0)]"
          aria-hidden
        />
      )}

      <div className={cn("flex-1 flex flex-col items-center justify-center", config.inner)}>
        <div className={cn("flex flex-col", config.container)}>
          {/* Header: optional icon + scanned label + title — icon and text centered */}
          <header className="w-full space-y-1 text-center">
            {config.showHeaderIcon && (
              <div className="flex w-full justify-center">
                <div className={cn(config.iconWrapper)}>
                  <Icon className="size-6 sm:size-7" />
                </div>
              </div>
            )}
            <p className={config.scannedLabel}>
              Scanned
            </p>
            <h1 className={config.title}>
              {typeLabel}
            </h1>
          </header>

          {/* Lost & found banner (vCard when owner enabled lost mode) */}
          {resolution.lostMessage && (
            <div className="rounded-xl border border-border/80 bg-muted/50 dark:bg-muted/30 px-4 py-3 text-center">
              <p className="text-sm text-foreground/90 leading-relaxed">
                {resolution.lostMessage}
              </p>
            </div>
          )}

          {/* Action buttons */}
          {actions.length > 0 && (
            <div className="flex flex-col gap-3">
              {actions
                .filter((a) => a.variant === "primary")
                .map((action, i) => (
                  <ActionButton
                    key={i}
                    action={action}
                    contentType={contentType}
                    themeId={landingTheme}
                  />
                ))}
              {actions.some((a) => a.variant === "secondary") && (
                <div className="grid grid-cols-2 gap-2">
                  {actions
                    .filter((a) => a.variant === "secondary")
                    .map((action, i) => (
                      <ActionButton
                        key={i}
                        action={action}
                        contentType={contentType}
                        themeId={landingTheme}
                      />
                    ))}
                </div>
              )}
            </div>
          )}

          {/* Display-only content: structured card for vcard/wifi/event, else pre */}
          {resolution.structured && ["vcard", "wifi", "event"].includes(contentType) ? (
            <StructuredContentBlock
              contentType={contentType}
              structured={resolution.structured}
              config={config}
            />
          ) : displayContent ? (
            <div className={cn("overflow-hidden text-left", config.contentBlock)}>
              <pre className="whitespace-pre-wrap font-sans text-sm text-inherit m-0 wrap-break-word opacity-95">
                {displayContent}
              </pre>
            </div>
          ) : null}
        </div>
      </div>

      {/* Footer */}
      <footer className={cn("mt-auto", config.footer)}>
        <Link
          href="/"
          className={cn(
            "inline-flex items-center transition-opacity hover:opacity-90",
            isFullTheme
              ? "text-indigo-200 hover:text-white dark:text-indigo-300 dark:hover:text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
          aria-label="UseQR – Home"
        >
          <Image
            src="/logo/png/logo.png"
            alt="UseQR"
            width={120}
            height={32}
            className="h-7 w-auto object-contain"
            priority={false}
          />
        </Link>
      </footer>
    </div>
  );
}
