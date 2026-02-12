import { redirect, notFound } from "next/navigation";
import { recordScan } from "@/lib/db/analytics";
import { getQRById } from "@/lib/db/qrs";
import { resolveQRScan } from "@/lib/qr/qr-types";
import { QRScanLanding } from "@/components/qr/QRScanLanding";

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

  if (qr.analyticsEnabled) {
    try {
      await recordScan(id);
    } catch (err) {
      console.error("[Scan page] Failed to record scan:", err);
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
