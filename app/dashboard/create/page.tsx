"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Calendar,
  Check,
  Crown,
  FileText,
  Link2,
  Loader2,
  Mail,
  MapPin,
  MessageCircle,
  MessageSquare,
  Phone,
  QrCode,
  Save,
  Smartphone,
  User,
  Wifi,
  Maximize2,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QRCodePreview } from "@/components/qr/QRCodePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { qrsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useCreateQRStore } from "@/stores/useCreateQRStore";
import { LANDING_THEMES, getThemeById } from "@/lib/qr/landing-theme";
import { LandingThemePreview } from "@/components/qr/LandingThemePreview";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { CountryCodeSelect } from "@/components/CountryCodeSelect";
import { normalizePhoneDigits } from "@/lib/countries";
import { getCardBaseUrl, QR_DEFAULT_FG, QR_DEFAULT_BG } from "@/lib/qr";
import type { QRDotType, QRCornerSquareType, QRCornerDotType } from "@/lib/qr";
import { cn } from "@/lib/utils";
import type { LandingThemeDb } from "@/lib/db/schemas/qr";

const PHONE_TYPES = ["phone", "sms", "whatsapp"] as const;
function isPhoneType(type: string | null): type is (typeof PHONE_TYPES)[number] {
  return type !== null && PHONE_TYPES.includes(type as (typeof PHONE_TYPES)[number]);
}

/** Types that show a landing page when scanned; URL redirects so no landing. */
const TYPES_WITH_LANDING = ["vcard", "wifi", "text", "email", "sms", "phone", "location", "event", "whatsapp"] as const;
function hasLandingPage(contentType: string | null): boolean {
  return contentType !== null && contentType !== "url" && TYPES_WITH_LANDING.includes(contentType as (typeof TYPES_WITH_LANDING)[number]);
}

const QR_TYPES = [
  { id: "url" as const, label: "URL / Link", description: "Website, landing page, or any link", icon: Link2, contentLabel: "URL or link", contentPlaceholder: "https://example.com" },
  { id: "smart_redirect" as const, label: "Smart redirect", description: "Redirect by device — App Store, Play Store, or fallback", icon: Smartphone, contentLabel: "Redirect URLs", contentPlaceholder: "" },
  { id: "vcard" as const, label: "vCard", description: "Contact card — name, phone, email", icon: User, contentLabel: "Contact details", contentPlaceholder: "Name, phone, email (coming soon)" },
  { id: "wifi" as const, label: "Wi‑Fi", description: "Network name and password", icon: Wifi, contentLabel: "Wi‑Fi details", contentPlaceholder: "Network name, password (coming soon)" },
  { id: "text" as const, label: "Plain text", description: "Short message or note", icon: FileText, contentLabel: "Your message", contentPlaceholder: "Enter your text..." },
  { id: "email" as const, label: "Email", description: "Pre-filled email (to, subject, body)", icon: Mail, contentLabel: "Email details", contentPlaceholder: "To, subject, body (coming soon)" },
  { id: "sms" as const, label: "SMS", description: "Pre-filled text message to a number", icon: MessageSquare, contentLabel: "Phone number & message", contentPlaceholder: "+1234567890 or number,message" },
  { id: "phone" as const, label: "Phone", description: "Tap to call a phone number", icon: Phone, contentLabel: "Phone number", contentPlaceholder: "+1234567890" },
  { id: "location" as const, label: "Location", description: "Map pin — address or coordinates", icon: MapPin, contentLabel: "Address or coordinates", contentPlaceholder: "Address or lat,lng" },
  { id: "event" as const, label: "Event", description: "Add to calendar — title, date, place", icon: Calendar, contentLabel: "Event details", contentPlaceholder: "Title, start, end (coming soon)" },
  { id: "whatsapp" as const, label: "WhatsApp", description: "Start a chat with a number", icon: MessageCircle, contentLabel: "Phone number (with country code)", contentPlaceholder: "+1234567890" },
] as const;

const QR_TEMPLATES = [
  { id: "classic" as const, label: "Classic", description: "Standard square modules", style: "squares" },
  { id: "rounded" as const, label: "Rounded", description: "Soft rounded corners", style: "rounded" },
  { id: "dots" as const, label: "Dots", description: "Circular modules", style: "dots" },
  { id: "minimal" as const, label: "Minimal", description: "Thin lines, clean look", style: "minimal" },
  { id: "branded" as const, label: "Branded", description: "Center space for logo", style: "branded" },
] as const;

const QR_PREVIEW_PATTERN = [1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1];

function TemplatePreview({ style }: { style: string }) {
  const base = "size-1.5 shrink-0 bg-foreground";
  return (
    <div className="grid grid-cols-4 gap-0.5" aria-hidden>
      {style === "squares" &&
        QR_PREVIEW_PATTERN.map((n, i) => (
          <div key={i} className={n ? base : "size-1.5 shrink-0 bg-transparent"} />
        ))}
      {style === "rounded" &&
        QR_PREVIEW_PATTERN.map((n, i) => (
          <div key={i} className={n ? `${base} rounded-sm` : "size-1.5 shrink-0 bg-transparent"} />
        ))}
      {style === "dots" &&
        QR_PREVIEW_PATTERN.map((n, i) => (
          <div key={i} className={n ? `${base} rounded-full` : "size-1.5 shrink-0 bg-transparent"} />
        ))}
      {style === "minimal" &&
        QR_PREVIEW_PATTERN.map((n, i) => (
          <div key={i} className={n ? `${base} opacity-60` : "size-1.5 shrink-0 bg-transparent"} />
        ))}
      {style === "branded" &&
        [1, 0, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 1, 1, 0, 1].map((n, i) => (
          <div
            key={i}
            className={
              n
                ? base
                : i === 5 || i === 6 || i === 9 || i === 10
                  ? "size-1.5 shrink-0 rounded-sm bg-muted"
                  : "size-1.5 shrink-0 bg-transparent"
            }
          />
        ))}
    </div>
  );
}

function CreateQRPageContent() {
  const previewQRId = useCreateQRStore((s) => s.previewQRId);
  const selectedType = useCreateQRStore((s) => s.selectedType);
  const name = useCreateQRStore((s) => s.name);
  const content = useCreateQRStore((s) => s.content);
  const selectedTemplate = useCreateQRStore((s) => s.selectedTemplate);
  const landingTheme = useCreateQRStore((s) => s.landingTheme);
  const analyticsEnabled = useCreateQRStore((s) => s.analyticsEnabled);
  const setSelectedType = useCreateQRStore((s) => s.setSelectedType);
  const setName = useCreateQRStore((s) => s.setName);
  const setContent = useCreateQRStore((s) => s.setContent);
  const phoneCountryCode = useCreateQRStore((s) => s.phoneCountryCode);
  const setPhoneCountryCode = useCreateQRStore((s) => s.setPhoneCountryCode);
  const phoneMessage = useCreateQRStore((s) => s.phoneMessage);
  const setPhoneMessage = useCreateQRStore((s) => s.setPhoneMessage);
  const smartRedirectIos = useCreateQRStore((s) => s.smartRedirectIos);
  const smartRedirectAndroid = useCreateQRStore((s) => s.smartRedirectAndroid);
  const smartRedirectFallback = useCreateQRStore((s) => s.smartRedirectFallback);
  const setSmartRedirectIos = useCreateQRStore((s) => s.setSmartRedirectIos);
  const setSmartRedirectAndroid = useCreateQRStore((s) => s.setSmartRedirectAndroid);
  const setSmartRedirectFallback = useCreateQRStore((s) => s.setSmartRedirectFallback);
  const setSelectedTemplate = useCreateQRStore((s) => s.setSelectedTemplate);
  const qrStyle = useCreateQRStore((s) => s.qrStyle);
  const setQRStyle = useCreateQRStore((s) => s.setQRStyle);
  const resetQRStyle = useCreateQRStore((s) => s.resetQRStyle);
  const setLandingTheme = useCreateQRStore((s) => s.setLandingTheme);
  const setAnalyticsEnabled = useCreateQRStore((s) => s.setAnalyticsEnabled);
  const loadForEdit = useCreateQRStore((s) => s.loadForEdit);
  const reset = useCreateQRStore((s) => s.reset);
  const editingId = useCreateQRStore((s) => s.editingId);
  const router = useRouter();
  const searchParams = useSearchParams();
  const editId = searchParams.get("edit");
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [editLoading, setEditLoading] = useState(!!editId);
  const [editError, setEditError] = useState<string | null>(null);
  const [previewThemeId, setPreviewThemeId] = useState<LandingThemeDb | null>(null);

  useEffect(() => {
    if (!editId || !editId.trim()) {
      setEditLoading(false);
      if (editingId) reset();
      return;
    }
    let cancelled = false;
    setEditLoading(true);
    setEditError(null);
    qrsApi
      .get(editId)
      .then((qr) => {
        if (!cancelled) loadForEdit({ ...qr, style: qr.style as import("@/lib/qr").QRStyle | undefined });
      })
      .catch((err) => {
        if (!cancelled) {
          setEditError(
            err?.response?.status === 404
              ? "QR code not found."
              : err?.response?.data?.error ?? "Failed to load QR for editing."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setEditLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [editId, loadForEdit, editingId, reset]);

  const handleSaveDraft = () => {
    toast.success("Draft saved — continue anytime from My QRs.");
    router.push("/dashboard/my-qrs");
  };

  const handleCreateQR = async () => {
    if (!selectedType) {
      toast.error("Choose a type.");
      return;
    }
    if (selectedType === "smart_redirect") {
      const fallback = smartRedirectFallback.trim();
      if (!fallback) {
        toast.error("Enter at least the default / fallback URL.");
        return;
      }
    } else if (!content?.trim()) {
      toast.error("Enter content.");
      return;
    }
    if (isPhoneType(selectedType)) {
      const nationalDigits = normalizePhoneDigits(content.trim());
      if (!nationalDigits) {
        toast.error("Enter a valid phone number (leading zeros are removed automatically).");
        return;
      }
    }
    setCreateLoading(true);
    setCreateError(null);
    let contentToSend = content.trim();
    if (isPhoneType(selectedType)) {
      const dialDigits = phoneCountryCode.replace(/\D/g, "");
      const nationalDigits = normalizePhoneDigits(contentToSend);
      contentToSend = dialDigits + nationalDigits;
    }
    if (selectedType === "smart_redirect") {
      contentToSend = smartRedirectFallback.trim();
    }
    const isSmsOrWhatsApp = selectedType === "sms" || selectedType === "whatsapp";
    const smartRedirectMeta =
      selectedType === "smart_redirect"
        ? {
            metadata: {
              smartRedirect: {
                ios: smartRedirectIos.trim() || undefined,
                android: smartRedirectAndroid.trim() || undefined,
                fallback: smartRedirectFallback.trim(),
              },
            },
          }
        : {};
    const effectiveStyle =
      Object.keys(qrStyle).length > 0
        ? { template: selectedTemplate, ...qrStyle }
        : undefined;

    try {
      const body = {
        name: name?.trim() || undefined,
        contentType: selectedType,
        content: contentToSend,
        ...(isSmsOrWhatsApp && phoneMessage.trim() ? { message: phoneMessage.trim() } : {}),
        ...smartRedirectMeta,
        template: selectedTemplate,
        ...(effectiveStyle ? { style: effectiveStyle } : {}),
        landingTheme,
        analyticsEnabled,
        ...(editingId ? {} : { status: "active" as const }),
      };
      if (editingId) {
        await qrsApi.update(editingId, body);
        reset();
        toast.success("QR code updated.");
        router.push(`/dashboard/my-qr/${editingId}`);
      } else {
        await qrsApi.create({ ...body, status: "active" });
        reset();
        toast.success("QR code created.");
        router.push("/dashboard/my-qrs");
      }
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? (editingId ? "Failed to update QR. Try again." : "Failed to create QR. Try again.");
      setCreateError(msg);
      toast.error(msg);
    } finally {
      setCreateLoading(false);
    }
  };

  const isEditMode = Boolean(editingId);

  if (editLoading) {
    return (
      <div className="flex max-h-svh flex-col overflow-hidden">
        <DashboardHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
              <Loader2 className="size-5 animate-spin" />
              <span>Loading QR for editing...</span>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (editId && editError) {
    return (
      <div className="flex max-h-svh flex-col overflow-hidden">
        <DashboardHeader />
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <div className="rounded-xl border border-destructive/30 bg-destructive/5 px-6 py-8 text-center">
              <p className="text-sm text-destructive">{editError}</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/my-qrs">Back to My QRs</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex max-h-svh flex-col overflow-hidden">
      <DashboardHeader />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Back button */}
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
          >
            <Link href={isEditMode ? `/dashboard/my-qr/${editingId}` : "/dashboard/my-qrs"}>
              <ArrowLeft className="size-4" />
              {isEditMode ? "Back to QR" : "Back to My QRs"}
            </Link>
          </Button>

          {/* Page title */}
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
              {isEditMode ? "Edit QR Code" : "Create QR Code"}
            </h1>
            <p className="mt-2 text-sm text-muted-foreground sm:text-base">
              {isEditMode
                ? "Update the type, content, or design. Changes apply to the same QR link."
                : "Choose a type, add your content, and get a reusable QR code you can update anytime."}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
            {/* Left: Type + Form */}
            <div className="space-y-8">
              {/* Step 1: Choose type */}
              <section
                className="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50"
                aria-labelledby="qr-type-heading"
              >
                <h2
                  id="qr-type-heading"
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
                    1
                  </span>
                  Choose type
                </h2>
                <ScrollArea className="mt-4 h-[280px] rounded-md border border-border">
                  <ul className="flex flex-col p-1" role="listbox" aria-label="QR type">
                    {QR_TYPES.map((type) => {
                      const Icon = type.icon;
                      const isSelected = selectedType === type.id;
                      return (
                        <li key={type.id} role="option" aria-selected={isSelected}>
                          <button
                            type="button"
                            onClick={() => setSelectedType(type.id)}
                            className={cn(
                              "flex w-full cursor-pointer items-center gap-3 rounded-md px-3 py-2.5 text-left outline-none transition-colors",
                              "hover:bg-accent hover:text-accent-foreground focus-visible:bg-accent focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                              isSelected && "bg-emerald-500/10 text-foreground hover:bg-emerald-500/15"
                            )}
                          >
                            <div
                              className={cn(
                                "flex size-9 shrink-0 items-center justify-center rounded-md",
                                isSelected ? "bg-emerald-500/20 text-emerald-500" : "bg-muted text-muted-foreground"
                              )}
                            >
                              <Icon className="size-4" aria-hidden />
                            </div>
                            <div className="min-w-0 flex-1">
                              <span className="block text-sm font-medium">
                                {type.label}
                              </span>
                              <span className="block truncate text-xs text-muted-foreground">
                                {type.description}
                              </span>
                            </div>
                            {isSelected && (
                              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white">
                                <Check className="size-3" aria-hidden />
                              </div>
                            )}
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </ScrollArea>
              </section>

              {/* Step 2: Details */}
              <section
                className="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50"
                aria-labelledby="qr-details-heading"
              >
                <h2
                  id="qr-details-heading"
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
                    2
                  </span>
                  Details
                </h2>
                <div className="mt-5 space-y-4">
                  <div>
                    <label
                      htmlFor="qr-name"
                      className="mb-1.5 block text-sm font-medium text-foreground"
                    >
                      Name this QR
                    </label>
                    <Input
                      id="qr-name"
                      type="text"
                      placeholder="e.g. Restaurant menu, Event sign-in"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                    />
                    <p className="mt-1.5 text-xs text-muted-foreground">
                      Only you see this — helps you find it in your dashboard.
                    </p>
                  </div>
                  {selectedType && (() => {
                    const typeConfig = QR_TYPES.find((t) => t.id === selectedType);
                    if (!typeConfig) return null;
                    const showCountryCode = isPhoneType(selectedType);
                    const showMessageField = selectedType === "sms" || selectedType === "whatsapp";
                    const showSmartRedirect = selectedType === "smart_redirect";
                    return (
                      <div className="space-y-4">
                        {showSmartRedirect ? (
                          <>
                            <div>
                              <label htmlFor="qr-smart-fallback" className="mb-1.5 block text-sm font-medium text-foreground">
                                Default / fallback URL <span className="text-destructive">*</span>
                              </label>
                              <Input
                                id="qr-smart-fallback"
                                type="url"
                                inputMode="url"
                                placeholder="https://example.com or App Store / Play Store link"
                                value={smartRedirectFallback}
                                onChange={(e) => setSmartRedirectFallback(e.target.value)}
                                className="border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                              />
                              <p className="mt-1.5 text-xs text-muted-foreground">
                                Used for desktop or when no platform-specific URL is set.
                              </p>
                            </div>
                            <div>
                              <label htmlFor="qr-smart-ios" className="mb-1.5 block text-sm font-medium text-foreground">
                                iOS (App Store) URL <span className="text-muted-foreground font-normal">(optional)</span>
                              </label>
                              <Input
                                id="qr-smart-ios"
                                type="url"
                                inputMode="url"
                                placeholder="https://apps.apple.com/app/..."
                                value={smartRedirectIos}
                                onChange={(e) => setSmartRedirectIos(e.target.value)}
                                className="border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                              />
                            </div>
                            <div>
                              <label htmlFor="qr-smart-android" className="mb-1.5 block text-sm font-medium text-foreground">
                                Android (Play Store) URL <span className="text-muted-foreground font-normal">(optional)</span>
                              </label>
                              <Input
                                id="qr-smart-android"
                                type="url"
                                inputMode="url"
                                placeholder="https://play.google.com/store/apps/..."
                                value={smartRedirectAndroid}
                                onChange={(e) => setSmartRedirectAndroid(e.target.value)}
                                className="border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                              />
                            </div>
                            <p className="text-xs text-muted-foreground">
                              Scanners are sent to the right link based on their device (iPhone → iOS URL, Android → Android URL, else fallback).
                            </p>
                          </>
                        ) : (
                          <>
                            <div>
                              <label
                                htmlFor="qr-content"
                                className="mb-1.5 block text-sm font-medium text-foreground"
                              >
                                {showCountryCode
                                  ? selectedType === "sms"
                                    ? "Phone number"
                                    : selectedType === "whatsapp"
                                      ? "Phone number"
                                      : typeConfig.contentLabel
                                  : typeConfig.contentLabel}
                              </label>
                        {showCountryCode ? (
                          <>
                            <div className="flex gap-2">
                              <CountryCodeSelect
                                value={phoneCountryCode}
                                onValueChange={setPhoneCountryCode}
                                triggerClassName="shrink-0 border-border focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                              />
                              <Input
                                id="qr-content"
                                type="tel"
                                inputMode="numeric"
                                autoComplete="tel-national"
                                placeholder="555 123 4567"
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                className="flex-1 border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                              />
                            </div>
                            <p className="mt-1.5 text-xs text-muted-foreground">
                              Enter number without leading 0 (e.g. 98765 43210). Leading zeros are removed automatically for international format.
                            </p>
                          </>
                        ) : (
                            <Input
                              id="qr-content"
                              type="text"
                              placeholder={typeConfig.contentPlaceholder}
                              value={content}
                              onChange={(e) => setContent(e.target.value)}
                              className="border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                            />
                          )}
                        </div>
                        {showMessageField && (
                          <div>
                            <label
                              htmlFor="qr-phone-message"
                              className="mb-1.5 block text-sm font-medium text-foreground"
                            >
                              {selectedType === "sms"
                                ? "Message (optional)"
                                : "Pre-filled message (optional)"}
                            </label>
                            <Input
                              id="qr-phone-message"
                              type="text"
                              placeholder={
                                selectedType === "sms"
                                  ? "Hi, I wanted to reach out..."
                                  : "Pre-filled text when they open the chat"
                              }
                              value={phoneMessage}
                              onChange={(e) => setPhoneMessage(e.target.value)}
                              className="border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                            />
                          </div>
                        )}
                          </>
                        )}
                      </div>
                    );
                  })()}
                </div>
              </section>

              {/* Step 3: Choose template design */}
              <section
                className="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50"
                aria-labelledby="qr-template-heading"
              >
                <h2
                  id="qr-template-heading"
                  className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"
                >
                  <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
                    3
                  </span>
                  Choose template design
                </h2>
                <p className="mt-2 text-xs text-muted-foreground">
                  How your QR code modules will look. You can change this later.
                </p>
                <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
                  {QR_TEMPLATES.map((template) => {
                    const isSelected = selectedTemplate === template.id;
                    return (
                      <button
                        key={template.id}
                        type="button"
                        onClick={() => setSelectedTemplate(template.id)}
                        className={cn(
                          "relative flex flex-col items-center gap-3 rounded-lg border p-4 text-center transition-all",
                          "hover:border-emerald-500/40 hover:bg-emerald-500/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                          isSelected
                            ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                            : "border-border bg-card"
                        )}
                      >
                        <div
                          className={cn(
                            "flex size-14 shrink-0 items-center justify-center rounded-lg border border-border bg-muted/30 p-2",
                            isSelected && "border-emerald-500/50 bg-emerald-500/5"
                          )}
                        >
                          <TemplatePreview style={template.style} />
                        </div>
                        <span className="block text-sm font-medium text-foreground">
                          {template.label}
                        </span>
                        <span className="block text-xs text-muted-foreground">
                          {template.description}
                        </span>
                        {isSelected && (
                          <div className="absolute right-2 top-2 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white">
                            <Check className="size-3" aria-hidden />
                          </div>
                        )}
                      </button>
                    );
                  })}
                </div>

                {/* Customize QR — colors, shapes, logo */}
                <section
                  className="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50"
                  aria-labelledby="qr-customize-heading"
                >
                  <div className="flex items-center justify-between gap-4">
                    <h2
                      id="qr-customize-heading"
                      className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"
                    >
                      <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
                        •
                      </span>
                      Customize QR
                    </h2>
                    {(qrStyle.fgColor ?? qrStyle.bgColor ?? qrStyle.logo?.url ?? qrStyle.dotType) != null && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="text-xs text-muted-foreground"
                        onClick={() => resetQRStyle()}
                      >
                        Reset to template
                      </Button>
                    )}
                  </div>
                  <p className="mt-2 text-xs text-muted-foreground">
                    Optional: set colors, dot shape, and add a center logo. Preview updates live.
                  </p>
                  <div className="mt-4 grid gap-6 sm:grid-cols-2">
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground">Colors</label>
                        <div className="flex gap-3">
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground">Dots</span>
                            <div className="flex gap-1.5">
                              <input
                                type="color"
                                value={qrStyle.fgColor ?? QR_DEFAULT_FG}
                                onChange={(e) => setQRStyle({ fgColor: e.target.value })}
                                className="h-9 w-12 cursor-pointer rounded border border-border bg-background p-0.5"
                              />
                              <Input
                                type="text"
                                value={qrStyle.fgColor ?? ""}
                                onChange={(e) => setQRStyle({ fgColor: e.target.value || undefined })}
                                placeholder={QR_DEFAULT_FG}
                                className="font-mono text-xs"
                                maxLength={7}
                              />
                            </div>
                          </div>
                          <div className="flex flex-col gap-1">
                            <span className="text-[10px] text-muted-foreground">Background</span>
                            <div className="flex gap-1.5">
                              <input
                                type="color"
                                value={qrStyle.bgColor ?? QR_DEFAULT_BG}
                                onChange={(e) => setQRStyle({ bgColor: e.target.value })}
                                className="h-9 w-12 cursor-pointer rounded border border-border bg-background p-0.5"
                              />
                              <Input
                                type="text"
                                value={qrStyle.bgColor ?? ""}
                                onChange={(e) => setQRStyle({ bgColor: e.target.value || undefined })}
                                placeholder={QR_DEFAULT_BG}
                                className="font-mono text-xs"
                                maxLength={7}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground">Shapes</label>
                        <div className="grid grid-cols-3 gap-2">
                          <div>
                            <span className="text-[10px] text-muted-foreground">Dots</span>
                            <select
                              value={qrStyle.dotType ?? ""}
                              onChange={(e) => setQRStyle({ dotType: (e.target.value || undefined) as QRDotType | undefined })}
                              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                            >
                              <option value="">Template default</option>
                              <option value="square">Square</option>
                              <option value="rounded">Rounded</option>
                              <option value="dots">Dots</option>
                              <option value="classy">Classy</option>
                              <option value="classy-rounded">Classy rounded</option>
                              <option value="extra-rounded">Extra rounded</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground">Corner square</span>
                            <select
                              value={qrStyle.cornerSquareType ?? ""}
                              onChange={(e) => setQRStyle({ cornerSquareType: (e.target.value || undefined) as QRCornerSquareType | undefined })}
                              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                            >
                              <option value="">Template default</option>
                              <option value="square">Square</option>
                              <option value="dot">Dot</option>
                              <option value="extra-rounded">Extra rounded</option>
                              <option value="rounded">Rounded</option>
                              <option value="dots">Dots</option>
                              <option value="classy">Classy</option>
                              <option value="classy-rounded">Classy rounded</option>
                            </select>
                          </div>
                          <div>
                            <span className="text-[10px] text-muted-foreground">Corner dot</span>
                            <select
                              value={qrStyle.cornerDotType ?? ""}
                              onChange={(e) => setQRStyle({ cornerDotType: (e.target.value || undefined) as QRCornerDotType | undefined })}
                              className="mt-1 w-full rounded-md border border-border bg-background px-2 py-1.5 text-xs"
                            >
                              <option value="">Template default</option>
                              <option value="square">Square</option>
                              <option value="dot">Dot</option>
                              <option value="rounded">Rounded</option>
                              <option value="dots">Dots</option>
                              <option value="classy">Classy</option>
                              <option value="classy-rounded">Classy rounded</option>
                              <option value="extra-rounded">Extra rounded</option>
                            </select>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-4">
                      <div>
                        <label className="mb-1.5 block text-xs font-medium text-foreground">Center logo</label>
                        <Input
                          type="url"
                          placeholder="https://example.com/logo.png"
                          value={qrStyle.logo?.url ?? ""}
                          onChange={(e) =>
                            setQRStyle({
                              logo: e.target.value.trim()
                                ? { url: e.target.value.trim(), size: qrStyle.logo?.size ?? 0.4, hideBackgroundDots: qrStyle.logo?.hideBackgroundDots ?? true }
                                : undefined,
                            })
                          }
                          className="text-xs"
                        />
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Public image URL. Use high contrast; QR uses H error correction when logo is set.
                        </p>
                        {qrStyle.logo?.url && (
                          <div className="mt-2 flex items-center gap-4">
                            <div className="flex items-center gap-2">
                              <span className="text-[10px] text-muted-foreground">Size</span>
                              <input
                                type="range"
                                min={0.2}
                                max={0.5}
                                step={0.05}
                                value={qrStyle.logo?.size ?? 0.4}
                                onChange={(e) =>
                                  setQRStyle({
                                    logo: {
                                      ...qrStyle.logo!,
                                      size: parseFloat(e.target.value),
                                    },
                                  })
                                }
                                className="w-24"
                              />
                              <span className="text-[10px] text-muted-foreground">
                                {Math.round((qrStyle.logo?.size ?? 0.4) * 100)}%
                              </span>
                            </div>
                            <label className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <input
                                type="checkbox"
                                checked={qrStyle.logo?.hideBackgroundDots ?? true}
                                onChange={(e) =>
                                  setQRStyle({
                                    logo: {
                                      ...qrStyle.logo!,
                                      hideBackgroundDots: e.target.checked,
                                    },
                                  })
                                }
                                className="rounded border-border"
                              />
                              Hide dots behind logo
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </section>
              </section>

              {/* Step 4: Landing page theme (only when scan shows a landing page; URL redirects) */}
              {hasLandingPage(selectedType) ? (
                <section
                  className="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50"
                  aria-labelledby="qr-landing-heading"
                >
                  <h2
                    id="qr-landing-heading"
                    className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-foreground"
                  >
                    <span className="flex size-7 items-center justify-center rounded-md bg-emerald-500/15 text-emerald-500">
                      4
                    </span>
                    Landing page theme
                  </h2>
                  <p className="mt-2 text-xs text-muted-foreground">
                    How the page looks when someone scans your QR. Pick a style below — you can change it later.
                  </p>
                  <div className="mt-4 max-h-[320px] overflow-y-auto overflow-x-hidden rounded-lg border border-border/60 bg-muted/20 p-1">
                    <div className="flex flex-col gap-2">
                      {LANDING_THEMES.map((theme) => {
                        const isSelected = landingTheme === theme.id;
                        return (
                          <div
                            key={theme.id}
                            className={cn(
                              "relative flex min-h-0 shrink-0 items-stretch gap-4 rounded-lg border p-3 text-left transition-all",
                              isSelected
                                ? "border-emerald-500 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                                : "border-border bg-card hover:border-border/80"
                            )}
                          >
                            <button
                              type="button"
                              onClick={() => setLandingTheme(theme.id)}
                              className="flex min-w-0 flex-1 items-stretch gap-4 text-left transition-colors rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                            >
                              {/* Mini preview — fixed width on left */}
                              <div className="h-[120px] w-[72px] shrink-0 overflow-hidden rounded-lg border border-border/80 bg-muted/30 shadow-sm">
                                <LandingThemePreview
                                  themeId={theme.id}
                                  contentType={selectedType ?? undefined}
                                  size="card"
                                  className="h-full w-full"
                                />
                              </div>
                              {/* Content — right side */}
                              <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5 pr-8">
                                <span className="block text-sm font-medium text-foreground">
                                  {theme.label}
                                </span>
                                <span className="block text-xs leading-snug text-muted-foreground">
                                  {theme.description}
                                </span>
                              </div>
                            </button>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2">
                              <Button
                                type="button"
                                variant="secondary"
                                size="sm"
                                className="h-8 gap-1.5 px-2.5 text-xs shadow-sm"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setPreviewThemeId(theme.id);
                                }}
                              >
                                <Maximize2 className="size-3.5" />
                                Preview
                              </Button>
                            </div>
                            {isSelected && (
                              <div className="absolute left-3 top-3 flex size-5 items-center justify-center rounded-full bg-emerald-500 text-white pointer-events-none">
                                <Check className="size-3" aria-hidden />
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Popup preview dialog */}
                  <Dialog
                    open={previewThemeId !== null}
                    onOpenChange={(open) => !open && setPreviewThemeId(null)}
                  >
                    <DialogContent className="max-w-[380px] p-0 overflow-hidden gap-0">
                      <DialogHeader className="p-4 pb-2">
                        <DialogTitle>
                          {previewThemeId
                            ? getThemeById(previewThemeId)?.label ?? "Preview"
                            : "Preview"}
                        </DialogTitle>
                        <p className="text-xs text-muted-foreground">
                          How this theme looks when someone scans your QR
                        </p>
                      </DialogHeader>
                      <div className="flex justify-center bg-muted/30 px-4 pb-6 pt-2">
                        <div className="w-[280px] overflow-hidden rounded-2xl border border-border bg-background shadow-lg">
                          {previewThemeId && (
                            <LandingThemePreview
                              themeId={previewThemeId}
                              contentType={selectedType ?? undefined}
                              size="popup"
                            />
                          )}
                        </div>
                      </div>
                    </DialogContent>
                  </Dialog>
                </section>
              ) : selectedType === "url" ? (
                <section
                  className="rounded-xl border border-border/60 bg-muted/30 p-5"
                  aria-labelledby="qr-landing-skip"
                >
                  <p id="qr-landing-skip" className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Links open directly.</span> When someone scans this QR, they’ll go straight to your URL — no landing page. Landing theme only applies to other types (call, contact, text, etc.).
                  </p>
                </section>
              ) : selectedType === "smart_redirect" ? (
                <section
                  className="rounded-xl border border-border/60 bg-muted/30 p-5"
                  aria-labelledby="qr-smart-redirect-skip"
                >
                  <p id="qr-smart-redirect-skip" className="text-sm text-muted-foreground">
                    <span className="font-medium text-foreground">Redirect by device.</span> Scanners are sent to the right URL based on their device (iOS → App Store, Android → Play Store, or your default link). No landing page.
                  </p>
                </section>
              ) : null}

              {/* Analytics toggle */}
              <section
                className="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50"
                aria-labelledby="qr-analytics-heading"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex gap-4">
                    <div className="flex size-11 shrink-0 items-center justify-center rounded-xl border border-border bg-muted/40 text-muted-foreground">
                      <BarChart3 className="size-5" aria-hidden />
                    </div>
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          id="qr-analytics-heading"
                          className="text-sm font-semibold text-foreground"
                        >
                          Scan analytics
                        </h2>
                        <span className="inline-flex items-center gap-1 rounded-md border border-amber-500/40 bg-linear-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 px-2 py-0.5 text-xs font-medium text-amber-600 dark:text-amber-400">
                          <Crown className="size-3" aria-hidden />
                          Premium
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Track when and where your QR is scanned. View counts and
                        insights in your dashboard.
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={analyticsEnabled}
                    aria-labelledby="qr-analytics-heading"
                    onClick={() => setAnalyticsEnabled(!analyticsEnabled)}
                    className={cn(
                      "relative inline-flex h-7 w-12 shrink-0 cursor-pointer items-center rounded-full border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                      analyticsEnabled
                        ? "border-emerald-500 bg-emerald-500"
                        : "border-border bg-muted"
                    )}
                  >
                    <span
                      className={cn(
                        "pointer-events-none inline-block size-6 translate-y-0 rounded-full bg-white shadow-sm ring-0 transition-transform",
                        analyticsEnabled ? "translate-x-5" : "translate-x-0.5"
                      )}
                    />
                  </button>
                </div>
                <p className="mt-3 flex items-center gap-2 rounded-md border border-border/80 bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                  {analyticsEnabled ? (
                    <>
                      <span className="size-1.5 shrink-0 rounded-full bg-emerald-500" />
                      Analytics enabled — scans will be counted and visible in Analytics.
                    </>
                  ) : (
                    <>
                      <span className="size-1.5 shrink-0 rounded-full bg-muted-foreground/50" />
                      Analytics disabled — this QR will not track scans.
                    </>
                  )}
                </p>
              </section>

              {createError && (
                <p className="rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
                  {createError}
                </p>
              )}
              {/* Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <Button
                  type="button"
                  variant="outline"
                  size="default"
                  className="border-border"
                  onClick={handleSaveDraft}
                  disabled={createLoading}
                >
                  <Save className="size-4" />
                  Save as draft
                </Button>
                <Button
                  size="lg"
                  disabled={
                  !selectedType ||
                  (selectedType === "smart_redirect" ? !smartRedirectFallback?.trim() : !content?.trim()) ||
                  createLoading
                }
                  onClick={handleCreateQR}
                  className="bg-emerald-500 text-white hover:bg-emerald-600 focus-visible:ring-emerald-500/25 disabled:opacity-50"
                >
                  {createLoading ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <QrCode className="size-4" />
                  )}
                  {isEditMode ? "Update QR code" : "Create QR code"}
                </Button>
              </div>
            </div>

            {/* Right: Live preview — sticky so it stays in view when scrolling */}
            <aside className="lg:sticky lg:top-8 lg:self-start">
              <div className="overflow-hidden rounded-2xl border border-border/80 bg-card shadow-lg shadow-black/5 dark:shadow-black/20">
                <div className="border-b border-border/60 bg-muted/30 px-5 py-3.5">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      {isEditMode ? "QR preview" : "Preview"}
                    </h3>
                    {isEditMode ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <span className="size-1.5 rounded-full bg-emerald-500" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center rounded-full bg-amber-500/15 px-2.5 py-0.5 text-xs font-medium text-amber-700 dark:text-amber-400">
                        Not live yet
                      </span>
                    )}
                  </div>
                </div>
                <div className="p-6">
                  <div className="flex flex-col items-center">
                    <div className="rounded-xl bg-white p-5 shadow-inner dark:bg-zinc-900/80 dark:shadow-none ring-1 ring-black/5 dark:ring-white/10">
                      <QRCodePreview
                        qrId={previewQRId}
                        templateId={selectedTemplate}
                        style={
                          Object.keys(qrStyle).length > 0
                            ? { template: selectedTemplate, ...qrStyle }
                            : undefined
                        }
                        size={200}
                        className="shrink-0"
                      />
                    </div>
                    <div className="mt-4 w-full space-y-2 text-center">
                      <p className="text-xs font-medium text-muted-foreground">
                        Link encoded in QR
                      </p>
                      <code className="block truncate rounded-md bg-muted/80 px-3 py-1.5 font-mono text-[11px] text-foreground" title="Full scan link">
                        {getCardBaseUrl().replace(/\/$/, "")}/q/{previewQRId}
                      </code>
                      <p className="text-[11px] text-muted-foreground/90">
                        {isEditMode
                          ? "This QR is live — scans work now. Save to apply changes."
                          : "Create your QR to publish — then this link will go live."}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </aside>
          </div>
        </div>
      </div>
    </div>
  );
}

function CreateQRPageFallback() {
  return (
    <div className="flex max-h-svh flex-col overflow-hidden">
      <DashboardHeader />
      <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center gap-2 py-16 text-muted-foreground">
            <Loader2 className="size-5 animate-spin" />
            <span>Loading...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateQRPage() {
  return (
    <Suspense fallback={<CreateQRPageFallback />}>
      <CreateQRPageContent />
    </Suspense>
  );
}
