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
  User,
  Wifi,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QRCodePreview } from "@/components/qr/QRCodePreview";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { qrsApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useCreateQRStore } from "@/stores/useCreateQRStore";
import { cn } from "@/lib/utils";

const QR_TYPES = [
  { id: "url" as const, label: "URL / Link", description: "Website, landing page, or any link", icon: Link2, contentLabel: "URL or link", contentPlaceholder: "https://example.com" },
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

type QRType = (typeof QR_TYPES)[number]["id"];

const QR_TEMPLATES = [
  { id: "classic" as const, label: "Classic", description: "Standard square modules", style: "squares" },
  { id: "rounded" as const, label: "Rounded", description: "Soft rounded corners", style: "rounded" },
  { id: "dots" as const, label: "Dots", description: "Circular modules", style: "dots" },
  { id: "minimal" as const, label: "Minimal", description: "Thin lines, clean look", style: "minimal" },
  { id: "branded" as const, label: "Branded", description: "Center space for logo", style: "branded" },
] as const;

type QRTemplateId = (typeof QR_TEMPLATES)[number]["id"];

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
  const analyticsEnabled = useCreateQRStore((s) => s.analyticsEnabled);
  const setSelectedType = useCreateQRStore((s) => s.setSelectedType);
  const setName = useCreateQRStore((s) => s.setName);
  const setContent = useCreateQRStore((s) => s.setContent);
  const setSelectedTemplate = useCreateQRStore((s) => s.setSelectedTemplate);
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
        if (!cancelled) loadForEdit(qr);
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
    if (!selectedType || !content?.trim()) {
      toast.error("Choose a type and enter content.");
      return;
    }
    setCreateLoading(true);
    setCreateError(null);
    try {
      const body = {
        name: name?.trim() || undefined,
        contentType: selectedType,
        content: content.trim(),
        template: selectedTemplate,
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
                    return (
                      <div>
                        <label
                          htmlFor="qr-content"
                          className="mb-1.5 block text-sm font-medium text-foreground"
                        >
                          {typeConfig.contentLabel}
                        </label>
                        <Input
                          id="qr-content"
                          type="text"
                          placeholder={typeConfig.contentPlaceholder}
                          value={content}
                          onChange={(e) => setContent(e.target.value)}
                          className="border-border bg-background focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                        />
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
              </section>

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
                  disabled={!selectedType || !content?.trim() || createLoading}
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
              <div className="rounded-xl border border-border bg-card p-6 shadow-sm ring-1 ring-border/50">
                <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  Preview
                </h3>
                <div className="mt-4 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 p-6">
                  <QRCodePreview
                    qrId={previewQRId}
                    templateId={selectedTemplate}
                    size={200}
                    className="shrink-0"
                  />
                  <p className="mt-3 text-center text-sm text-muted-foreground">
                    Live preview — scans to <span className="font-mono text-xs">/q/{previewQRId}</span>
                  </p>
                  <p className="mt-1 text-center text-xs text-muted-foreground">
                    Change type or template to update the QR.
                  </p>
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
