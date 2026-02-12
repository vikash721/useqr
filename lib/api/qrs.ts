import { api } from "@/lib/axios";

// ---------------------------------------------------------------------------
// Types (match API response shapes)
// ---------------------------------------------------------------------------

export type QRListItem = {
  id: string;
  name: string;
  contentType: string;
  content: string;
  payload: string;
  template: string;
  analyticsEnabled: boolean;
  status: string;
  scanCount: number;
  createdAt: string;
  updatedAt: string;
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
  template?: string;
  analyticsEnabled?: boolean;
  status?: string;
};

export type QRUpdateBody = {
  name?: string;
  contentType?: string;
  content?: string;
  template?: string;
  analyticsEnabled?: boolean;
  status?: string;
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
} as const;
