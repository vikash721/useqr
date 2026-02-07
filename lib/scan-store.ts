const QR_ID_PATTERN = /^[a-zA-Z0-9_-]{1,64}$/;

const scans = new Map<string, { scannedAt: number }>();

/** Listeners for SSE: when recordScan(qrId) is called, all callbacks for that qrId are invoked. */
type ScanStatusPayload = { scanned: boolean; scannedAt?: number };
const scanListeners = new Map<string, Set<(payload: ScanStatusPayload) => void>>();

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
  const scannedAt = Date.now();
  scans.set(qrId, { scannedAt });
  const payload: ScanStatusPayload = { scanned: true, scannedAt };
  const listeners = scanListeners.get(qrId);
  if (listeners) {
    listeners.forEach((cb) => {
      try {
        cb(payload);
      } catch (_) {}
    });
    scanListeners.delete(qrId);
  }
}

/** Subscribe to be notified when this qrId is scanned. Returns unsubscribe. */
export function subscribeScan(
  qrId: string,
  callback: (payload: ScanStatusPayload) => void
): () => void {
  if (!isValidQrId(qrId)) return () => {};
  let set = scanListeners.get(qrId);
  if (!set) {
    set = new Set();
    scanListeners.set(qrId, set);
  }
  set.add(callback);
  return () => {
    const s = scanListeners.get(qrId);
    if (s) {
      s.delete(callback);
      if (s.size === 0) scanListeners.delete(qrId);
    }
  };
}

export function getScanStatus(qrId: string): { scanned: boolean; scannedAt?: number } | null {
  if (!isValidQrId(qrId)) return null;
  const entry = scans.get(qrId);
  if (!entry) return { scanned: false };
  return { scanned: true, scannedAt: entry.scannedAt };
}
