const QR_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

const scans = new Map<string, { scannedAt: number }>();

export function isValidQrId(qrId: unknown): qrId is string {
  return (
    typeof qrId === "string" &&
    qrId.length > 0 &&
    qrId.length <= 64 &&
    QR_ID_PATTERN.test(qrId)
  );
}

export function recordScan(qrId: string): void {
  if (!isValidQrId(qrId)) return;
  scans.set(qrId, { scannedAt: Date.now() });
}

export function getScanStatus(qrId: string): { scanned: boolean; scannedAt?: number } | null {
  if (!isValidQrId(qrId)) return null;
  const entry = scans.get(qrId);
  if (!entry) return { scanned: false };
  return { scanned: true, scannedAt: entry.scannedAt };
}
