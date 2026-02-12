"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateQRId } from "@/lib/qr";
import type { QRTemplateId } from "@/lib/qr";
import type { QRContentType } from "@/lib/qr/payload";

export type CreateQRState = {
  /** Stable id for preview / card URL; regenerated on reset */
  previewQRId: string;
  /** Selected content type (url, vcard, text, etc.) */
  selectedType: QRContentType | null;
  /** User-facing name for this QR (dashboard label) */
  name: string;
  /** Raw content (URL, text, phone, etc. depending on type) */
  content: string;
  /** Template design (classic, rounded, dots, etc.) */
  selectedTemplate: QRTemplateId;
  /** Whether to track scans and show analytics for this QR */
  analyticsEnabled: boolean;
};

export type CreateQRActions = {
  setSelectedType: (type: QRContentType | null) => void;
  setName: (name: string) => void;
  setContent: (content: string) => void;
  setSelectedTemplate: (template: QRTemplateId) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  /** Reset form and generate a new preview id (e.g. after create or "Start over") */
  reset: () => void;
};

const initialState: CreateQRState = {
  previewQRId: "",
  selectedType: null,
  name: "",
  content: "",
  selectedTemplate: "classic",
  analyticsEnabled: true,
};

function getInitialState(): CreateQRState {
  return {
    ...initialState,
    previewQRId: generateQRId(),
  };
}

export const useCreateQRStore = create<CreateQRState & CreateQRActions>()(
  persist(
    (set) => ({
      ...getInitialState(),
      setSelectedType: (selectedType) => set({ selectedType }),
      setName: (name) => set({ name }),
      setContent: (content) => set({ content }),
      setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
      reset: () => set(getInitialState()),
    }),
    {
      name: "useqr-create-draft",
      partialize: (s) => ({
        selectedType: s.selectedType,
        name: s.name,
        content: s.content,
        selectedTemplate: s.selectedTemplate,
        analyticsEnabled: s.analyticsEnabled,
      }),
      // Don't persist previewQRId — fresh per session; draft fields restore on revisit
    }
  )
);
