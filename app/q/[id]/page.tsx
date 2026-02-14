import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { recordScan, hasScannedInSession } from "@/lib/db/analytics";
import { getQRById } from "@/lib/db/qrs";
import { resolveQRScan } from "@/lib/qr/qr-types";
import { QRDisabledFallback } from "@/components/qr/QRDisabledFallback";
import { QRScanLanding } from "@/components/qr/QRScanLanding";
import { MarkScanSession } from "@/components/qr/MarkScanSession";

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
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ScanPage({ params, searchParams }: Props) {
  const { id } = await params;
  const search = await searchParams;
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

  // Check if this QR was already scanned in this session
  let shouldMarkSession = false;
  if (qr.analyticsEnabled) {
    try {
      const alreadyScanned = await hasScannedInSession(id);
      if (!alreadyScanned) {
        // Extract UTM params from query string (only available via searchParams)
        const utm = {
          utmSource: typeof search.utm_source === "string" ? search.utm_source : undefined,
          utmMedium: typeof search.utm_medium === "string" ? search.utm_medium : undefined,
          utmCampaign: typeof search.utm_campaign === "string" ? search.utm_campaign : undefined,
          utmContent: typeof search.utm_content === "string" ? search.utm_content : undefined,
        };
        // Record the scan — headers (UA, geo, referrer) are read internally by recordScan
        await recordScan(id, utm);
        shouldMarkSession = true;
      }
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
    <>
      {shouldMarkSession && <MarkScanSession qrId={id} />}
      <QRScanLanding
        resolution={resolution}
        contentType={qr.contentType}
        landingTheme={landingTheme}
      />
    </>
  );
}
