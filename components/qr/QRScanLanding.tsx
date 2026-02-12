"use client";

import Link from "next/link";
import {
  Phone,
  Mail,
  MessageSquare,
  MessageCircle,
  Link2,
  ExternalLink,
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

const ACTION_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  phone: Phone,
  email: Mail,
  sms: MessageSquare,
  whatsapp: MessageCircle,
  url: Link2,
  default: ExternalLink,
};

function getActionIcon(contentType: QRContentTypeDb) {
  return ACTION_ICONS[contentType] ?? ACTION_ICONS.default;
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
  const Icon = getActionIcon(contentType);
  const isExternal =
    action.href.startsWith("http") ||
    action.href.startsWith("tel:") ||
    action.href.startsWith("mailto:") ||
    action.href.startsWith("sms:");

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
          {/* Header: optional icon + scanned label + title */}
          <header className="space-y-1">
            {config.showHeaderIcon && (
              <div className={cn("flex justify-center", config.iconWrapper)}>
                <Icon className="size-6 sm:size-7" />
              </div>
            )}
            <p className={cn(config.scannedLabel, config.showHeaderIcon ? "text-center" : "")}>
              Scanned
            </p>
            <h1 className={cn(config.title, config.showHeaderIcon ? "text-center" : "")}>
              {typeLabel}
            </h1>
          </header>

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

          {/* Display-only content */}
          {displayContent && (
            <div className={cn("overflow-hidden text-left", config.contentBlock)}>
              <pre className="whitespace-pre-wrap font-sans text-sm text-inherit m-0 wrap-break-word opacity-95">
                {displayContent}
              </pre>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className={cn("mt-auto", config.footer)}>
        <Link
          href="/"
          className={cn(
            "transition-colors underline underline-offset-2",
            isFullTheme
              ? "text-indigo-200 hover:text-white dark:text-indigo-300 dark:hover:text-white"
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          UseQR
        </Link>
      </footer>
    </div>
  );
}
