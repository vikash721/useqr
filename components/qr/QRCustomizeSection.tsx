"use client";

import { useState } from "react";
import { ChevronDown, Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useCreateQRStore } from "@/stores/useCreateQRStore";
import { toast } from "@/lib/toast";
import { QR_DEFAULT_FG, QR_DEFAULT_BG } from "@/lib/qr";
import type { QRDotType, QRCornerSquareType, QRCornerDotType } from "@/lib/qr";

const DOT_OPTIONS: { value: QRDotType | ""; label: string }[] = [
  { value: "", label: "Default" },
  { value: "square", label: "Square" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy rounded" },
  { value: "extra-rounded", label: "Extra rounded" },
];

const CORNER_SQUARE_OPTIONS: { value: QRCornerSquareType | ""; label: string }[] = [
  { value: "", label: "Default" },
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "extra-rounded", label: "Extra rounded" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy rounded" },
];

const CORNER_DOT_OPTIONS: { value: QRCornerDotType | ""; label: string }[] = [
  { value: "", label: "Default" },
  { value: "square", label: "Square" },
  { value: "dot", label: "Dot" },
  { value: "rounded", label: "Rounded" },
  { value: "dots", label: "Dots" },
  { value: "classy", label: "Classy" },
  { value: "classy-rounded", label: "Classy rounded" },
  { value: "extra-rounded", label: "Extra rounded" },
];

/**
 * Customize QR section: colors, shapes, and center logo.
 * Vertical stack: each subsection uses full width.
 */
export function QRCustomizeSection() {
  const qrStyle = useCreateQRStore((s) => s.qrStyle);
  const setQRStyle = useCreateQRStore((s) => s.setQRStyle);
  const resetQRStyle = useCreateQRStore((s) => s.resetQRStyle);
  const [logoUploading, setLogoUploading] = useState(false);

  return (
    <section
      className="rounded-xl border border-border bg-card p-6 shadow-sm"
      aria-labelledby="qr-customize-heading"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
      <h2
                  id="qr-type-heading"
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
                    3
                  </span>
                    Customize QR
                </h2>
        {(qrStyle.fgColor ?? qrStyle.bgColor ?? qrStyle.logo?.url ?? qrStyle.dotType) != null && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="text-xs text-muted-foreground hover:text-foreground"
            onClick={() => resetQRStyle()}
          >
            Reset to template
          </Button>
        )}
      </div>
      <p className="mt-1.5 text-xs text-muted-foreground">
        Set colors, shapes, and optional center logo. Preview updates live.
      </p>

      {/* Vertical stack: full width per subsection */}
      <div className="mt-6 flex flex-col gap-6">
        {/* 1. Colors — full width row */}
        <div className="w-full rounded-lg border border-border/80 bg-muted/30 p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-foreground/90">
            Colors
          </h3>
          <div className="mt-3 flex flex-wrap gap-6 sm:gap-8">
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[200px]">
              <label className="w-20 shrink-0 text-xs text-muted-foreground">Dots</label>
              <input
                type="color"
                value={qrStyle.fgColor ?? QR_DEFAULT_FG}
                onChange={(e) => setQRStyle({ fgColor: e.target.value })}
                className="h-9 w-12 shrink-0 cursor-pointer rounded border border-border bg-background"
              />
              <Input
                type="text"
                value={qrStyle.fgColor ?? ""}
                onChange={(e) => setQRStyle({ fgColor: e.target.value || undefined })}
                placeholder={QR_DEFAULT_FG}
                className="h-9 min-w-0 flex-1 font-mono text-sm max-sm:max-w-[120px]"
                maxLength={7}
              />
            </div>
            <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[200px]">
              <label className="w-20 shrink-0 text-xs text-muted-foreground">Background</label>
              <input
                type="color"
                value={qrStyle.bgColor ?? QR_DEFAULT_BG}
                onChange={(e) => setQRStyle({ bgColor: e.target.value })}
                className="h-9 w-12 shrink-0 cursor-pointer rounded border border-border bg-background"
              />
              <Input
                type="text"
                value={qrStyle.bgColor ?? ""}
                onChange={(e) => setQRStyle({ bgColor: e.target.value || undefined })}
                placeholder={QR_DEFAULT_BG}
                className="h-9 min-w-0 flex-1 font-mono text-sm max-sm:max-w-[120px]"
                maxLength={7}
              />
            </div>
          </div>
        </div>

        {/* 2. Shapes — full width row, three dropdowns side by side */}
        <div className="w-full rounded-lg border border-border/80 bg-muted/30 p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-foreground/90">
            Shapes
          </h3>
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Dots</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full justify-between border-border bg-background font-normal text-sm"
                  >
                    <span className="truncate">
                      {DOT_OPTIONS.find((o) => o.value === (qrStyle.dotType ?? ""))?.label ?? "Default"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-(--radix-dropdown-menu-trigger-width)">
                  {DOT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value || "default"}
                      onClick={() =>
                        setQRStyle({ dotType: (opt.value || undefined) as QRDotType | undefined })
                      }
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Corner square</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full justify-between border-border bg-background font-normal text-sm"
                  >
                    <span className="truncate">
                      {CORNER_SQUARE_OPTIONS.find((o) => o.value === (qrStyle.cornerSquareType ?? ""))?.label ?? "Default"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-(--radix-dropdown-menu-trigger-width)">
                  {CORNER_SQUARE_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value || "default"}
                      onClick={() =>
                        setQRStyle({
                          cornerSquareType: (opt.value || undefined) as QRCornerSquareType | undefined,
                        })
                      }
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            <div>
              <label className="mb-1 block text-xs text-muted-foreground">Corner dot</label>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="h-9 w-full justify-between border-border bg-background font-normal text-sm"
                  >
                    <span className="truncate">
                      {CORNER_DOT_OPTIONS.find((o) => o.value === (qrStyle.cornerDotType ?? ""))?.label ?? "Default"}
                    </span>
                    <ChevronDown className="size-4 shrink-0 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="min-w-(--radix-dropdown-menu-trigger-width)">
                  {CORNER_DOT_OPTIONS.map((opt) => (
                    <DropdownMenuItem
                      key={opt.value || "default"}
                      onClick={() =>
                        setQRStyle({
                          cornerDotType: (opt.value || undefined) as QRCornerDotType | undefined,
                        })
                      }
                    >
                      {opt.label}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>

        {/* 3. Center logo — full width */}
        <div className="w-full rounded-lg border border-border/80 bg-muted/30 p-4">
          <h3 className="text-xs font-medium uppercase tracking-wider text-foreground/90">
            Center logo
          </h3>
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex flex-wrap items-center gap-3">
              <label className="inline-flex h-9 cursor-pointer items-center gap-2 rounded border border-border bg-background px-4 text-sm font-medium transition-colors hover:bg-muted/50">
                <Upload className="size-4 shrink-0" />
                Upload image
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp,image/gif"
                  className="sr-only"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setLogoUploading(true);
                    try {
                      const form = new FormData();
                      form.append("file", f);
                      const res = await fetch("/api/upload", { method: "POST", body: form });
                      const data = await res.json();
                      if (!res.ok) throw new Error(data.error ?? "Upload failed");
                      setQRStyle({
                        logo: {
                          url: data.url,
                          size: qrStyle.logo?.size ?? 0.4,
                          hideBackgroundDots: qrStyle.logo?.hideBackgroundDots ?? true,
                        },
                      });
                      toast.success("Logo uploaded");
                    } catch (err) {
                      toast.error(err instanceof Error ? err.message : "Upload failed");
                    } finally {
                      setLogoUploading(false);
                      e.target.value = "";
                    }
                  }}
                  disabled={logoUploading}
                />
              </label>
              {logoUploading && (
                <span className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Uploading…
                </span>
              )}
              {qrStyle.logo?.url && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="h-9 px-3 text-sm text-muted-foreground hover:text-foreground"
                  onClick={() => setQRStyle({ logo: undefined })}
                >
                  <X className="size-4 mr-1.5" /> Remove logo
                </Button>
              )}
            </div>
            {qrStyle.logo?.url && (
              <div className="flex flex-wrap items-center gap-6 border-t border-border/60 pt-3">
                <div className="flex min-w-0 flex-1 items-center gap-3 sm:min-w-[200px]">
                  <label className="w-12 shrink-0 text-xs text-muted-foreground">Size</label>
                  <input
                    type="range"
                    min={0.2}
                    max={0.5}
                    step={0.05}
                    value={qrStyle.logo?.size ?? 0.4}
                    onChange={(e) =>
                      setQRStyle({
                        logo: { ...qrStyle.logo!, size: parseFloat(e.target.value) },
                      })
                    }
                    className="h-2 min-w-0 flex-1 cursor-pointer accent-emerald-500"
                  />
                  <span className="w-10 shrink-0 text-right text-sm font-medium">
                    {Math.round((qrStyle.logo?.size ?? 0.4) * 100)}%
                  </span>
                </div>
                <label className="flex cursor-pointer items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={qrStyle.logo?.hideBackgroundDots ?? true}
                    onChange={(e) =>
                      setQRStyle({
                        logo: { ...qrStyle.logo!, hideBackgroundDots: e.target.checked },
                      })
                    }
                    className="size-4 rounded border-border accent-emerald-500"
                  />
                  Hide dots behind logo
                </label>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
