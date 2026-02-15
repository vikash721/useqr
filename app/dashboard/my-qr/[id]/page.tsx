"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  Check,
  Copy,
  ChevronDown,
  Crown,
  Download,
  ExternalLink,
  Loader2,
  MapPin,
  Pencil,
  ShieldOff,
  Trash2,
} from "lucide-react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { QRBasicAnalytics } from "@/components/qr/QRBasicAnalytics";
import { QRCodePreview } from "@/components/qr/QRCodePreview";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Skeleton } from "@/components/ui/skeleton";
import { qrsApi, type QRListItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import {
  buildQRData,
  downloadQRAsPng,
  getCardBaseUrl,
  sanitizeFilename,
  parseVCard,
  parseWifiString,
  parseEventString,
  type QRTemplateId,
  type QRStyle,
} from "@/lib/qr";
import { cn } from "@/lib/utils";

/** Formatted one-line summary for detail page content block (vcard/wifi/event/email). */
function getContentSummary(contentType: string, content: string | undefined): string | null {
  const raw = (content ?? "").trim();
  if (!raw) return null;
  switch (contentType) {
    case "vcard": {
      if (!raw.includes("BEGIN:VCARD")) return null;
      const v = parseVCard(raw);
      const name = [v.firstName, v.lastName].filter(Boolean).join(" ").trim();
      const parts = [name, v.organization, v.phone, v.email].filter(Boolean);
      return parts.length ? parts.join(" · ") : null;
    }
    case "wifi": {
      const w = parseWifiString(raw);
      if (!w.ssid) return null;
      return w.password ? `${w.ssid} (password set)` : w.ssid;
    }
    case "event": {
      const e = parseEventString(raw);
      if (!e?.title) return null;
      const when = e.start ? new Date(e.start).toLocaleString(undefined, { dateStyle: "short", timeStyle: "short" }) : "";
      return when ? `${e.title} — ${when}` : e.title;
    }
    case "email": {
      const toMatch = raw.match(/mailto:([^?]+)/);
      const to = toMatch ? toMatch[1].trim() : raw.replace(/^mailto:/, "").split("?")[0].trim();
      return to || null;
    }
    default:
      return null;
  }
}

function formatContentType(type: string): string {
  const map: Record<string, string> = {
    url: "URL",
    vcard: "vCard",
    wifi: "Wi‑Fi",
    text: "Text",
    email: "Email",
    sms: "SMS",
    phone: "Phone",
    location: "Location",
    event: "Event",
    whatsapp: "WhatsApp",
  };
  return map[type] ?? type;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function LostAndFoundSection({
  qr,
  lostUpdating,
  onLostModeChange,
}: {
  qr: QRListItem;
  lostUpdating: boolean;
  onLostModeChange: (enabled: boolean) => void;
}) {
  const meta = qr.metadata as { vcardLostMode?: boolean } | undefined;
  const enabled = meta?.vcardLostMode === true;

  return (
    <div>
      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
        Lost & found
      </h3>
      <div className="mt-1">
        <label className="flex cursor-pointer items-center gap-2 text-sm text-foreground">
          <Switch
            checked={enabled}
            onCheckedChange={onLostModeChange}
            disabled={lostUpdating}
          />
          {enabled ? "On" : "Off"}
        </label>
      </div>
    </div>
  );
}

const DOWNLOAD_QUALITIES = [
  { label: "Standard (512px)", size: 512, description: "Screen & sharing", premium: false },
  { label: "High (1024px)", size: 1024, description: "Large display & small print", premium: true },
  { label: "Print (2048px)", size: 2048, description: "High-resolution print", premium: true },
] as const;

export default function MyQRDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [qr, setQr] = useState<QRListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [urlCopied, setUrlCopied] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [lostUpdating, setLostUpdating] = useState(false);
  const [downloadLoading, setDownloadLoading] = useState(false);

  const fetchQr = useCallback(() => {
    if (!id) {
      setError("Invalid QR id");
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    qrsApi
      .get(id)
      .then((data) => {
        setQr(data);
      })
      .catch((err) => {
        setQr(null);
        setError(
          err?.response?.status === 404
            ? "QR code not found."
            : err?.response?.data?.error ?? "Failed to load QR code."
        );
      })
      .finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    fetchQr();
  }, [fetchQr]);

  const handleDelete = async () => {
    if (!id) return;
    setDeleting(true);
    try {
      await qrsApi.delete(id);
      toast.success("QR code deleted.");
      router.push("/dashboard/my-qrs");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to delete. Try again.";
      toast.error(msg);
      setDeleting(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id || !qr) return;
    setStatusUpdating(true);
    try {
      const updated = await qrsApi.update(id, { status: newStatus });
      setQr(updated);
      toast.success(
        newStatus === "active"
          ? "QR code is now active. Scans will work."
          : "QR code disabled. Scans will see a disabled message."
      );
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to update status. Try again.";
      toast.error(msg);
    } finally {
      setStatusUpdating(false);
    }
  };

  const handleLostModeChange = async (enabled: boolean) => {
    if (!id || !qr) return;
    setLostUpdating(true);
    try {
      const meta = (qr.metadata ?? {}) as Record<string, unknown>;
      const item = typeof meta.vcardLostItem === "string" ? meta.vcardLostItem : "";
      const updated = await qrsApi.update(id, {
        metadata: { ...meta, vcardLostMode: enabled, vcardLostItem: item },
      });
      setQr(updated);
      toast.success(enabled ? "Lost & found message enabled." : "Lost & found message disabled.");
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { error?: string } } })?.response?.data
          ?.error ?? "Failed to update. Try again.";
      toast.error(msg);
    } finally {
      setLostUpdating(false);
    }
  };

  const handleDownload = async (size: number) => {
    if (!qr) return;
    setDownloadLoading(true);
    try {
      const data = buildQRData("url", "", {
        baseUrl: getCardBaseUrl(),
        qrId: qr.id,
      });
      const slug = sanitizeFilename(qr.name || qr.id);
      const filename = `UseQR-${slug}-${size}px.png`;
      await downloadQRAsPng({
        data,
        templateId: (qr.template || "classic") as QRTemplateId,
        style: (qr.style ?? undefined) as QRStyle | undefined,
        size,
        filename,
      });
      toast.success(`Downloaded ${filename}`);
    } catch (err) {
      console.error("[download QR]", err);
      toast.error("Download failed. Try again.");
    } finally {
      setDownloadLoading(false);
    }
  };

  if (!id) {
    return (
      <>
        <DashboardHeader />
        <div className="flex flex-1 flex-col overflow-y-auto">
          <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
            <p className="text-sm text-destructive">Invalid QR code.</p>
            <Button asChild variant="outline" className="mt-4">
              <Link href="/dashboard/my-qrs">Back to My QRs</Link>
            </Button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <DashboardHeader />
      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="-ml-2 mb-4 text-muted-foreground hover:text-foreground"
          >
            <Link href="/dashboard/my-qrs">
              <ArrowLeft className="size-4" />
              Back to My QRs
            </Link>
          </Button>

          {loading && (
            <div className="space-y-6">
              <Skeleton className="h-8 w-64 rounded-lg" />
              <div className="flex gap-8">
                <Skeleton className="h-64 w-64 shrink-0 rounded-2xl" />
                <div className="min-w-0 flex-1 space-y-4">
                  <Skeleton className="h-6 w-full rounded-md" />
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-10 w-48 rounded-md" />
                </div>
              </div>
            </div>
          )}

          {!loading && error && (
            <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-6">
              <p className="text-sm text-destructive">{error}</p>
              <Button asChild variant="outline" className="mt-4">
                <Link href="/dashboard/my-qrs">Back to My QRs</Link>
              </Button>
            </div>
          )}

          {!loading && !error && qr && (
            <div className="space-y-8">
              {/* Header */}
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                    {qr.name || "Unnamed QR"}
                  </h1>
                  <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-muted-foreground">
                    <span className="inline-flex rounded-full bg-muted/80 px-2.5 py-0.5 font-medium text-foreground/90">
                      {formatContentType(qr.contentType)}
                    </span>
                    {qr.analyticsEnabled && (
                      <span className="inline-flex items-center gap-1">
                        <BarChart3 className="size-3.5" />
                        Analytics on
                      </span>
                    )}
                    {!!(qr.metadata as Record<string, unknown> | undefined)?.geoLock && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                        <MapPin className="size-3" />
                        Geo locked
                      </span>
                    )}
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2 sm:mt-0">
                  <Button asChild className="bg-emerald-500 hover:bg-emerald-600">
                    <a
                      href={`/q/${qr.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="size-4" />
                      Open scan page
                    </a>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href={`/dashboard/create?edit=${qr.id}`}>
                      <Pencil className="size-4" />
                      Edit
                    </Link>
                  </Button>
                  <Button
                    variant="outline"
                    className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:text-destructive"
                    onClick={() => setDeleteOpen(true)}
                  >
                    <Trash2 className="size-4" />
                    Delete
                  </Button>
                </div>
              </div>

              {qr.status !== "active" && (
                <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3 text-sm text-amber-700 dark:text-amber-400">
                  <span className="font-medium">This QR is disabled.</span>{" "}
                  People who scan it will see a message that the code is disabled. Enable it again in the Status section below.
                </div>
              )}

              {qr.contentType === "vcard" && (qr.metadata as { vcardLostMode?: boolean } | undefined)?.vcardLostMode === true && (
                qr.status !== "active" ? (
                  <div className="rounded-xl border border-red-500/30 bg-red-500/5 px-4 py-3 text-sm text-red-700 dark:text-red-400">
                    <span className="font-medium">QR is disabled.</span>{" "}
                    People can’t contact you until you enable this QR. Turn it on in the Status section below so your lost & found message works.
                  </div>
                ) : (
                  <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3 text-sm text-emerald-700 dark:text-emerald-400">
                    <span className="font-medium">Lost & found is on.</span>{" "}
                    When someone scans this QR they’ll see a message that you’ve lost an item and your contact details below.
                  </div>
                )
              )}

              {/* QR + details card */}
              <div
                className={cn(
                  "rounded-2xl border border-border bg-card shadow-sm overflow-hidden",
                  qr.status !== "active" && "opacity-90"
                )}
              >
                <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
                  <div className="flex shrink-0 flex-col items-center gap-3">
                    <div className="flex justify-center rounded-xl border border-border bg-muted/20 p-4">
                      <QRCodePreview
                        qrId={qr.id}
                        templateId={(qr.template || "classic") as QRTemplateId}
                        style={(qr.style ?? undefined) as QRStyle | undefined}
                        size={200}
                        compact
                        className="shrink-0"
                      />
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full gap-2"
                          disabled={downloadLoading}
                        >
                          {downloadLoading ? (
                            <Loader2 className="size-4 animate-spin" />
                          ) : (
                            <Download className="size-4" />
                          )}
                          Download PNG
                          <ChevronDown className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="center" className="min-w-[220px]">
                        {DOWNLOAD_QUALITIES.map(({ label, size: px, description, premium }) => (
                          <DropdownMenuItem
                            key={px}
                            onClick={() => handleDownload(px)}
                            disabled={downloadLoading}
                          >
                            <div className="flex w-full flex-col items-start gap-0.5">
                              <span className="flex items-center gap-2 font-medium">
                                {label}
                                {premium && (
                                  <Crown className="size-3.5 shrink-0 text-amber-500" aria-label="Premium" />
                                )}
                              </span>
                              <span className="text-xs text-muted-foreground">
                                {description}
                              </span>
                            </div>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="min-w-0 space-y-4">
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Content
                      </h3>
                      <p
                        className={cn(
                          "mt-1 break-all text-sm text-foreground",
                          (qr.content?.length ?? 0) > 200 && "line-clamp-4"
                        )}
                      >
                        {getContentSummary(qr.contentType, qr.content) ?? qr.content ?? "—"}
                      </p>
                    </div>
                    {qr.contentType === "vcard" && (
                      <LostAndFoundSection
                        qr={qr}
                        lostUpdating={lostUpdating}
                        onLostModeChange={handleLostModeChange}
                      />
                    )}
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Scan URL
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-1.5">
                        <span className="break-all font-mono text-xs text-muted-foreground">
                          {qr.payload || "—"}
                        </span>
                        {qr.payload && qr.payload !== "—" && (
                          <Button
                            variant="ghost"
                            size="icon"
                            className={cn(
                              "inline-flex h-7 w-7 shrink-0 hover:text-foreground",
                              urlCopied ? "text-green-500" : "text-muted-foreground"
                            )}
                            onClick={() => {
                              const url = qr.payload.startsWith("http")
                                ? qr.payload
                                : `${getCardBaseUrl()}${qr.payload.startsWith("/") ? "" : "/"}${qr.payload}`;
                              void navigator.clipboard.writeText(url);
                              setUrlCopied(true);
                              toast.success("Scan URL copied to clipboard");
                              setTimeout(() => setUrlCopied(false), 2000);
                            }}
                          >
                            {urlCopied ? (
                              <Check className="size-3.5" />
                            ) : (
                              <Copy className="size-3.5" />
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Status
                      </h3>
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              className="gap-2"
                              disabled={statusUpdating}
                            >
                              {statusUpdating ? (
                                <Loader2 className="size-4 animate-spin" />
                              ) : qr.status === "active" ? (
                                <>
                                  <span className="inline-flex size-2 rounded-full bg-emerald-500" />
                                  Active
                                </>
                              ) : (
                                <>
                                  <ShieldOff className="size-4" />
                                  {qr.status === "disabled" ? "Disabled" : qr.status}
                                </>
                              )}
                              <ChevronDown className="size-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start">
                            <DropdownMenuItem
                              onClick={() => handleStatusChange("active")}
                              disabled={qr.status === "active"}
                            >
                              {qr.status === "active" && <Check className="size-4" />}
                              Active — scans work
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => handleStatusChange("disabled")}
                              disabled={qr.status === "disabled"}
                            >
                              {qr.status === "disabled" && <Check className="size-4" />}
                              Disabled — scans see disabled message
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                        <span className="text-sm text-muted-foreground">
                          Updated {formatDate(qr.updatedAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Basic analytics */}
              <QRBasicAnalytics
                qrId={qr.id}
                analyticsEnabled={qr.analyticsEnabled}
                scanCount={qr.scanCount ?? 0}
                onAnalyticsChange={fetchQr}
              />
            </div>
          )}
        </div>
      </div>

      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent showCloseButton className="sm:max-w-md border-border/80 p-0 overflow-hidden">
          <div className="flex flex-col items-start pt-8 pb-2 px-6 text-left">
            <div className="flex flex-row items-center justify-start gap-3">
              <div className="flex size-12 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <Trash2 className="size-6" strokeWidth={1.5} />
              </div>
              <DialogHeader className="pb-0 pt-0 text-left">
                <DialogTitle className="text-xl font-semibold tracking-tight">
                  Delete this QR code?
                </DialogTitle>
              </DialogHeader>
            </div>
            <DialogDescription className="mt-3 text-left text-sm text-muted-foreground leading-relaxed max-w-[320px]">
              The scan link will stop working and this cannot be undone. Your analytics data will also be removed.
            </DialogDescription>
          </div>
          <div className="flex flex-col-reverse sm:flex-row gap-2 sm:justify-end px-6 pb-6 pt-2 bg-muted/30 border-t border-border/50">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
              className="sm:min-w-[88px]"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
              className="gap-2 sm:min-w-[100px]"
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Delete QR
                </>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
