import { api } from "@/lib/axios";

// ---------------------------------------------------------------------------
// Types (match API response shapes)
// ---------------------------------------------------------------------------

/** QR style (colors, logo, shapes) — matches QRStyle from lib/qr */
export type QRListItemStyle = {
  template?: string;
  fgColor?: string;
  bgColor?: string;
  dotType?: string;
  cornerSquareType?: string;
  cornerDotType?: string;
  logo?: { url: string; size?: number; hideBackgroundDots?: boolean };
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  shape?: "square" | "circle";
};

export type QRListItem = {
  id: string;
  name: string;
  contentType: string;
  content: string;
  payload: string;
  template: string;
  style?: QRListItemStyle;
  landingTheme?: string;
  analyticsEnabled: boolean;
  status: string;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
  metadata?: {
    message?: string;
    smartRedirect?: { ios?: string; android?: string; fallback?: string };
    vcardLostMode?: boolean;
    vcardLostItem?: string;
  };
};

export type QRListResponse = {
  qrs: QRListItem[];
  total: number;
};

export type QRDetailResponse = {
  qr: QRListItem;
};

export type QRCreateResponse = {
  ok: boolean;
  qr: QRListItem;
};

export type QRUpdateResponse = {
  ok: boolean;
  qr: QRListItem;
};

export type QRCreateBody = {
  name?: string;
  contentType: string;
  content: string;
  message?: string;
  metadata?: { smartRedirect?: { ios?: string; android?: string; fallback?: string } };
  template?: string;
  /** Full QR style (colors, logo, shapes). */
  style?: QRListItemStyle;
  landingTheme?: string;
  analyticsEnabled?: boolean;
  status?: string;
};

export type QRUpdateBody = {
  name?: string;
  contentType?: string;
  content?: string;
  message?: string;
  metadata?: {
    smartRedirect?: { ios?: string; android?: string; fallback?: string };
    vcardLostMode?: boolean;
    vcardLostItem?: string;
  };
  template?: string;
  style?: QRListItemStyle;
  landingTheme?: string;
  analyticsEnabled?: boolean;
  status?: string;
};

export type ScanByDay = { date: string; scans: number };
export type ScansByDevice = { device: string; scans: number };
export type ScansByCountry = { country: string; scans: number };
export type ScansByReferrer = { referrer: string; scans: number };
export type ScansByUtmSource = { source: string; scans: number };

export type QRAnalyticsResponse = {
  qr: { id: string; name: string; contentType: string; createdAt: string; scanCount: number };
  lastScannedAt: string | null;
  scansByDay: ScanByDay[];
  scansByDevice: ScansByDevice[];
  scansByCountry: ScansByCountry[];
  scansByReferrer: ScansByReferrer[];
  scansByUtmSource: ScansByUtmSource[];
};

// ---------------------------------------------------------------------------
// Endpoints
// ---------------------------------------------------------------------------

export const qrsApi = {
  /** List current user's QRs. Query: limit (default 50, max 100), skip (default 0). */
  list: (params?: { limit?: number; skip?: number }) =>
    api
      .get<QRListResponse>("/api/qrs", { params })
      .then((res) => res.data),

  /** Get a single QR by id. 404 if not found or not owned. */
  get: (id: string) =>
    api.get<QRDetailResponse>(`/api/qrs/${encodeURIComponent(id)}`).then((res) => res.data.qr),

  /** Create a new QR. Returns the created QR. */
  create: (body: QRCreateBody) =>
    api.post<QRCreateResponse>("/api/qrs", body).then((res) => res.data),

  /** Update a QR by id. Returns the updated QR. */
  update: (id: string, body: QRUpdateBody) =>
    api
      .patch<QRUpdateResponse>(`/api/qrs/${encodeURIComponent(id)}`, body)
      .then((res) => res.data.qr),

  /** Delete a QR by id. Returns { ok: true }. */
  delete: (id: string) =>
    api
      .delete<{ ok: boolean }>(`/api/qrs/${encodeURIComponent(id)}`)
      .then((res) => res.data),

  /** Get scan analytics for a QR (scans by day, last scanned). 404 if not found or not owned. */
  getAnalytics: (id: string) =>
    api
      .get<QRAnalyticsResponse>(`/api/qrs/${encodeURIComponent(id)}/analytics`)
      .then((res) => res.data),
} as const;
