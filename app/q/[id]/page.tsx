import { redirect, notFound } from "next/navigation";
import { headers } from "next/headers";
import { recordScan } from "@/lib/db/analytics";
import { getQRById } from "@/lib/db/qrs";
import { resolveQRScan } from "@/lib/qr/qr-types";
import { QRDisabledFallback } from "@/components/qr/QRDisabledFallback";
import { QRScanLanding } from "@/components/qr/QRScanLanding";
import { MarkScanSession } from "@/components/qr/MarkScanSession";
import { GeoGate } from "@/components/qr/GeoGate";

type SmartRedirectUrls = { ios?: string; android?: string; fallback?: string };
type GeoLock = { lat: number; lng: number; radiusMeters: number };

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

  // Extract geo lock config (if set)
  const geoLock = (qr.metadata as Record<string, unknown> | undefined)?.geoLock as GeoLock | undefined;
  const isGeoLocked = !!(geoLock?.lat != null && geoLock?.lng != null && geoLock?.radiusMeters);

  // Prepare UTM params for client-side scan recording
  let utm: { utmSource?: string; utmMedium?: string; utmCampaign?: string; utmContent?: string } | undefined;
  if (qr.analyticsEnabled) {
    utm = {
      utmSource: typeof search.utm_source === "string" ? search.utm_source : undefined,
      utmMedium: typeof search.utm_medium === "string" ? search.utm_medium : undefined,
      utmCampaign: typeof search.utm_campaign === "string" ? search.utm_campaign : undefined,
      utmContent: typeof search.utm_content === "string" ? search.utm_content : undefined,
    };
  }

  const shouldMarkSession = qr.analyticsEnabled;

  // --- Smart redirect ---
  if (qr.contentType === "smart_redirect") {
    const redirects = qr.metadata?.smartRedirect as SmartRedirectUrls | undefined;
    if (redirects && (redirects.ios || redirects.android || redirects.fallback)) {
      const headersList = await headers();
      const userAgent = headersList.get("user-agent") ?? "";
      const url = getSmartRedirectUrl(redirects, userAgent);
      if (url) {
        if (isGeoLocked) {
          // Geo-locked: validate location client-side first, then redirect
          if (qr.analyticsEnabled) await recordScan(id, utm);
          return <GeoGate qrId={id} geoLock={geoLock!} redirectUrl={url} />;
        }
        // Not geo-locked: server-side redirect
        if (qr.analyticsEnabled) await recordScan(id, utm);
        redirect(url);
      }
    }
  }

  // --- Resolve content behavior (redirect vs landing) ---
  const resolution = resolveQRScan(
    qr.contentType,
    qr.content,
    qr.metadata
  );

  if (resolution.behavior === "redirect") {
    if (isGeoLocked) {
      // Geo-locked redirect: validate location client-side first
      if (qr.analyticsEnabled) await recordScan(id, utm);
      return <GeoGate qrId={id} geoLock={geoLock!} redirectUrl={resolution.url} />;
    }
    // Not geo-locked: server-side redirect
    if (qr.analyticsEnabled) await recordScan(id, utm);
    redirect(resolution.url);
  }

  // --- Landing page ---
  const landingTheme = qr.landingTheme ?? "default";
  const landingContent = (
    <>
      {shouldMarkSession && <MarkScanSession qrId={id} utm={utm} />}
      <QRScanLanding
        resolution={resolution}
        contentType={qr.contentType}
        landingTheme={landingTheme}
      />
    </>
  );

  if (isGeoLocked) {
    return (
      <GeoGate qrId={id} geoLock={geoLock!}>
        {landingContent}
      </GeoGate>
    );
  }

  return landingContent;
}
