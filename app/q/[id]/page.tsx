import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import { recordScan } from "@/lib/db/analytics";
import { getQRById } from "@/lib/db/qrs";

type Props = {
  params: Promise<{ id: string }>;
};

function isValidUrl(s: string): boolean {
  const t = s.trim();
  return t.startsWith("http://") || t.startsWith("https://");
}

export default async function ScanPage({ params }: Props) {
  const { id } = await params;
  if (!id || id.length > 64) {
    notFound();
  }

  const qr = await getQRById(id);
  if (!qr) {
    notFound();
  }

  if (qr.analyticsEnabled) {
    try {
      await recordScan(id);
    } catch (err) {
      console.error("[Scan page] Failed to record scan:", err);
    }
  }

  const { contentType, content } = qr;
  const trimmed = content.trim();

  if (contentType === "url" && isValidUrl(trimmed)) {
    redirect(trimmed);
  }

  return (
    <div className="min-h-svh bg-background px-4 py-12 text-foreground">
      <div className="mx-auto max-w-md text-center">
        <h1 className="text-lg font-semibold">QR content</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Open the link or action below.
        </p>
        <div className="mt-6 flex flex-col gap-3">
          {contentType === "phone" && trimmed && (
            <a
              href={`tel:${trimmed}`}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600"
            >
              Call {trimmed}
            </a>
          )}
          {contentType === "email" && trimmed && (
            <a
              href={`mailto:${trimmed}`}
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600"
            >
              Email {trimmed}
            </a>
          )}
          {contentType === "sms" && trimmed && (() => {
            const [num, ...rest] = trimmed.split(/[,\s]/);
            const body = rest.join(" ").trim();
            const href = body ? `sms:${num}?body=${encodeURIComponent(body)}` : `sms:${num}`;
            return (
              <a
                href={href}
                className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600"
              >
                Send SMS
              </a>
            );
          })()}
          {contentType === "whatsapp" && trimmed && (
            <a
              href={`https://wa.me/${trimmed.replace(/\D/g, "")}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center rounded-lg bg-emerald-500 px-4 py-3 text-sm font-medium text-white hover:bg-emerald-600"
            >
              Open WhatsApp
            </a>
          )}
          {(contentType === "text" ||
            contentType === "vcard" ||
            contentType === "wifi" ||
            contentType === "location" ||
            contentType === "event") && (
            <p className="rounded-lg border border-border bg-card p-4 text-left text-sm text-foreground whitespace-pre-wrap">
              {trimmed || "No content."}
            </p>
          )}
          {contentType === "url" && !isValidUrl(trimmed) && (
            <p className="rounded-lg border border-border bg-card p-4 text-left text-sm text-foreground">
              {trimmed || "No URL."}
            </p>
          )}
        </div>
        <p className="mt-8 text-xs text-muted-foreground">
          <Link href="/" className="underline hover:text-foreground">
            UseQR
          </Link>
        </p>
      </div>
    </div>
  );
}
