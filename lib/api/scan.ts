import { api } from "@/lib/axios";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type ScanStatusPayload = {
  scanned: boolean;
  scannedAt?: number;
};

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const scanApi = {
  /** Record that a QR code was scanned. */
  record: (qrId: string) => api.post<void>("/api/scan", { qrId }),

  /** Poll current scan status for a QR id. */
  getStatus: (qrId: string) =>
    api
      .get<ScanStatusPayload>("/api/scan/status", {
        params: { qrId },
      })
      .then((res) => res.data),
} as const;
