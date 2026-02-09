/**
 * Dummy analytics data for QR codes. Replace with API calls when backend is ready.
 */

export type QrCodeSummary = {
  id: string;
  title: string;
  type: "link" | "image" | "video" | "contact";
  totalScans: number;
  lastScannedAt: string | null;
  createdAt: string;
};

export type ScanByDay = {
  date: string; // YYYY-MM-DD
  scans: number;
};

export type QrAnalytics = QrCodeSummary & {
  scansByDay: ScanByDay[];
};

const DUMMY_QR_LIST: QrCodeSummary[] = [
  {
    id: "qr-1",
    title: "Landing page",
    type: "link",
    totalScans: 142,
    lastScannedAt: "2026-02-09T10:30:00Z",
    createdAt: "2026-01-10T08:00:00Z",
  },
  {
    id: "qr-2",
    title: "Menu PDF",
    type: "link",
    totalScans: 89,
    lastScannedAt: "2026-02-08T18:45:00Z",
    createdAt: "2026-01-20T12:00:00Z",
  },
  {
    id: "qr-3",
    title: "Business card",
    type: "contact",
    totalScans: 23,
    lastScannedAt: "2026-02-07T14:20:00Z",
    createdAt: "2026-02-01T09:00:00Z",
  },
  {
    id: "qr-4",
    title: "Product video",
    type: "video",
    totalScans: 56,
    lastScannedAt: "2026-02-09T09:15:00Z",
    createdAt: "2026-01-25T16:00:00Z",
  },
  {
    id: "qr-5",
    title: "Event poster",
    type: "image",
    totalScans: 34,
    lastScannedAt: null,
    createdAt: "2026-02-05T11:00:00Z",
  },
];

/** Last 14 days of scans per QR (dummy). */
const DUMMY_SCANS_BY_DAY: Record<string, ScanByDay[]> = {
  "qr-1": [
    { date: "2026-01-27", scans: 8 },
    { date: "2026-01-28", scans: 12 },
    { date: "2026-01-29", scans: 9 },
    { date: "2026-01-30", scans: 11 },
    { date: "2026-01-31", scans: 7 },
    { date: "2026-02-01", scans: 15 },
    { date: "2026-02-02", scans: 6 },
    { date: "2026-02-03", scans: 10 },
    { date: "2026-02-04", scans: 14 },
    { date: "2026-02-05", scans: 9 },
    { date: "2026-02-06", scans: 11 },
    { date: "2026-02-07", scans: 13 },
    { date: "2026-02-08", scans: 8 },
    { date: "2026-02-09", scans: 9 },
  ],
  "qr-2": [
    { date: "2026-01-27", scans: 4 },
    { date: "2026-01-28", scans: 7 },
    { date: "2026-01-29", scans: 5 },
    { date: "2026-01-30", scans: 6 },
    { date: "2026-01-31", scans: 8 },
    { date: "2026-02-01", scans: 4 },
    { date: "2026-02-02", scans: 9 },
    { date: "2026-02-03", scans: 6 },
    { date: "2026-02-04", scans: 7 },
    { date: "2026-02-05", scans: 5 },
    { date: "2026-02-06", scans: 8 },
    { date: "2026-02-07", scans: 4 },
    { date: "2026-02-08", scans: 10 },
    { date: "2026-02-09", scans: 6 },
  ],
  "qr-3": [
    { date: "2026-01-27", scans: 0 },
    { date: "2026-01-28", scans: 1 },
    { date: "2026-01-29", scans: 2 },
    { date: "2026-01-30", scans: 1 },
    { date: "2026-01-31", scans: 3 },
    { date: "2026-02-01", scans: 2 },
    { date: "2026-02-02", scans: 1 },
    { date: "2026-02-03", scans: 4 },
    { date: "2026-02-04", scans: 2 },
    { date: "2026-02-05", scans: 1 },
    { date: "2026-02-06", scans: 2 },
    { date: "2026-02-07", scans: 3 },
    { date: "2026-02-08", scans: 0 },
    { date: "2026-02-09", scans: 0 },
  ],
  "qr-4": [
    { date: "2026-01-27", scans: 2 },
    { date: "2026-01-28", scans: 5 },
    { date: "2026-01-29", scans: 4 },
    { date: "2026-01-30", scans: 3 },
    { date: "2026-01-31", scans: 6 },
    { date: "2026-02-01", scans: 4 },
    { date: "2026-02-02", scans: 3 },
    { date: "2026-02-03", scans: 5 },
    { date: "2026-02-04", scans: 2 },
    { date: "2026-02-05", scans: 4 },
    { date: "2026-02-06", scans: 3 },
    { date: "2026-02-07", scans: 2 },
    { date: "2026-02-08", scans: 4 },
    { date: "2026-02-09", scans: 5 },
  ],
  "qr-5": [
    { date: "2026-01-27", scans: 0 },
    { date: "2026-01-28", scans: 0 },
    { date: "2026-01-29", scans: 0 },
    { date: "2026-01-30", scans: 0 },
    { date: "2026-01-31", scans: 0 },
    { date: "2026-02-01", scans: 0 },
    { date: "2026-02-02", scans: 2 },
    { date: "2026-02-03", scans: 5 },
    { date: "2026-02-04", scans: 8 },
    { date: "2026-02-05", scans: 6 },
    { date: "2026-02-06", scans: 4 },
    { date: "2026-02-07", scans: 5 },
    { date: "2026-02-08", scans: 3 },
    { date: "2026-02-09", scans: 1 },
  ],
};

export function getDummyQrList(): QrCodeSummary[] {
  return DUMMY_QR_LIST;
}

export function getDummyQrById(id: string): QrCodeSummary | undefined {
  return DUMMY_QR_LIST.find((q) => q.id === id);
}

export function getDummyQrAnalytics(id: string): QrAnalytics | null {
  const qr = getDummyQrById(id);
  if (!qr) return null;
  const scansByDay = DUMMY_SCANS_BY_DAY[id] ?? [];
  return { ...qr, scansByDay };
}

export function formatQrType(type: QrCodeSummary["type"]): string {
  const labels: Record<QrCodeSummary["type"], string> = {
    link: "Link",
    image: "Image",
    video: "Video",
    contact: "Contact",
  };
  return labels[type] ?? type;
}
