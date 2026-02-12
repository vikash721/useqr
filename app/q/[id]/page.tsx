import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { recordScan } from "@/lib/db/analytics";
import { getQRById } from "@/lib/db/qrs";
import { resolveQRScan } from "@/lib/qr/qr-types";
import { QRDisabledFallback } from "@/components/qr/QRDisabledFallback";
import { QRScanLanding } from "@/components/qr/QRScanLanding";

type SmartRedirectUrls = { ios?: string; android?: string; fallback?: string };

function getSmartRedirectUrl(redirects: SmartRedirectUrls, userAgent: string): string {
  const ua = userAgent.toLowerCase();
  const isIos = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  if (isIos && redirects.ios?.trim()) return redirects.ios.trim();
  if (isAndroid && redirects.android?.trim()) return redirects.android.trim();
  return redirects.fallback?.trim() || redirects.ios?.trim() || redirects.android?.trim() || "";
}

type Props = {
  params: Promise<{ id: string }>;
};

export default async function ScanPage({ params }: Props) {
  const { id } = await params;
  if (!id || id.length > 64) {
    notFound();
  }

  const qr = await getQRById(id);
  if (!qr) {
    notFound();
  }

  if (qr.status !== "active") {
    return <QRDisabledFallback />;
  }

  if (qr.analyticsEnabled) {
    try {
      await recordScan(id);
    } catch (err) {
      console.error("[Scan page] Failed to record scan:", err);
    }
  }

  if (qr.contentType === "smart_redirect") {
    const redirects = qr.metadata?.smartRedirect as SmartRedirectUrls | undefined;
    if (redirects && (redirects.ios || redirects.android || redirects.fallback)) {
      const headersList = await headers();
      const userAgent = headersList.get("user-agent") ?? "";
      const url = getSmartRedirectUrl(redirects, userAgent);
      if (url) redirect(url);
    }
  }

  const resolution = resolveQRScan(
    qr.contentType,
    qr.content,
    qr.metadata
  );

  if (resolution.behavior === "redirect") {
    redirect(resolution.url);
  }

  const landingTheme = qr.landingTheme ?? "default";

  return (
    <QRScanLanding
      resolution={resolution}
      contentType={qr.contentType}
      landingTheme={landingTheme}
    />
  );
}
