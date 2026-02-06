"use client";

import { create } from "zustand";

const STORAGE_KEY = "qr_landing_id";

export type ScanStatus = {
  scanned: boolean;
  scannedAt?: number;
};

type ScanStore = {
  qrId: string | null;
  scanStatus: ScanStatus | null;
  setQrId: (id: string | null) => void;
  setScanStatus: (status: ScanStatus | null) => void;
  initQrId: () => void;
  reset: () => void;
};

function getStoredQrId(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem(STORAGE_KEY);
}

function generateQrId(): string {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 8);
}

export const useScanStore = create<ScanStore>((set) => ({
  qrId: null,
  scanStatus: null,
  setQrId: (id) => set({ qrId: id }),
  setScanStatus: (status) => set({ scanStatus: status }),
  initQrId: () => {
    if (typeof window === "undefined") return;
    const stored = getStoredQrId();
    if (stored) {
      set({ qrId: stored });
      return;
    }
    const id = generateQrId();
    sessionStorage.setItem(STORAGE_KEY, id);
    set({ qrId: id });
  },
  reset: () => {
    if (typeof window !== "undefined") sessionStorage.removeItem(STORAGE_KEY);
    set({ qrId: null, scanStatus: null });
  },
}));
