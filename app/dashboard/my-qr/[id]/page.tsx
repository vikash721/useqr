"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  BarChart3,
  ExternalLink,
  Loader2,
  Pencil,
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
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { qrsApi, type QRListItem } from "@/lib/api";
import { toast } from "@/lib/toast";
import type { QRTemplateId, QRStyle } from "@/lib/qr";
import { cn } from "@/lib/utils";

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

export default function MyQRDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = typeof params?.id === "string" ? params.id : "";
  const [qr, setQr] = useState<QRListItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
                    <span>{qr.scanCount ?? 0} scans</span>
                    <span>Created {formatDate(qr.createdAt)}</span>
                    {qr.analyticsEnabled && (
                      <span className="inline-flex items-center gap-1">
                        <BarChart3 className="size-3.5" />
                        Analytics on
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

              {/* QR + details card */}
              <div className="rounded-2xl border border-border bg-card shadow-sm overflow-hidden">
                <div className="grid gap-6 p-6 sm:grid-cols-[auto_1fr]">
                  <div className="flex shrink-0 justify-center rounded-xl border border-border bg-muted/20 p-4">
                    <QRCodePreview
                      qrId={qr.id}
                      templateId={(qr.template || "classic") as QRTemplateId}
                      style={(qr.style ?? undefined) as QRStyle | undefined}
                      size={200}
                      compact
                      className="shrink-0"
                    />
                  </div>
                  <div className="min-w-0 space-y-4">
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Content
                      </h3>
                      <p
                        className={cn(
                          "mt-1 break-all text-sm text-foreground",
                          qr.content?.length > 200 && "line-clamp-4"
                        )}
                      >
                        {qr.content || "—"}
                      </p>
                    </div>
                    <div>
                      <h3 className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                        Scan URL
                      </h3>
                      <p className="mt-1 break-all font-mono text-xs text-muted-foreground">
                        {qr.payload || "—"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-muted-foreground">
                      <span>Status: {qr.status}</span>
                      <span>Updated {formatDate(qr.updatedAt)}</span>
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
        <DialogContent showCloseButton className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete QR code?</DialogTitle>
            <DialogDescription>
              This will permanently delete this QR code. The scan link will no
              longer work. This cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="outline"
              onClick={() => setDeleteOpen(false)}
              disabled={deleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={deleting}
            >
              {deleting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <>
                  <Trash2 className="size-4" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
