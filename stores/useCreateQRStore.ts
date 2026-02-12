"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateQRId } from "@/lib/qr";
import type { QRTemplateId } from "@/lib/qr";
import type { QRContentType } from "@/lib/qr/payload";
import type { LandingThemeDb } from "@/lib/db/schemas/qr";
import { DEFAULT_LANDING_THEME } from "@/lib/qr/landing-theme";
import { parseDialFromFullNumber } from "@/lib/countries";

export type CreateQRState = {
  /** Stable id for preview / card URL; regenerated on reset. When editing, set to the QR id. */
  previewQRId: string;
  /** When set, we are in edit mode; submit will PATCH this id instead of POST. */
  editingId: string | null;
  /** Selected content type (url, vcard, text, etc.) */
  selectedType: QRContentType | null;
  /** User-facing name for this QR (dashboard label) */
  name: string;
  /** Raw content (URL, text, phone, etc. depending on type). For phone/sms/whatsapp, when editing this is full number; in form we may show national only and combine with phoneCountryCode on submit. */
  content: string;
  /** Country dial code for phone/sms/whatsapp (e.g. +1, +91). Used with content (national number) when type is phone/sms/whatsapp. */
  phoneCountryCode: string;
  /** Optional message for SMS (body) or WhatsApp (pre-filled text). Separate from content (number). */
  phoneMessage: string;
  /** Smart redirect: iOS URL (e.g. App Store). Used when type is smart_redirect. */
  smartRedirectIos: string;
  /** Smart redirect: Android URL (e.g. Play Store). Used when type is smart_redirect. */
  smartRedirectAndroid: string;
  /** Smart redirect: Fallback URL (desktop / unknown device). Used when type is smart_redirect. */
  smartRedirectFallback: string;
  /** Template design (classic, rounded, dots, etc.) */
  selectedTemplate: QRTemplateId;
  /** Landing page theme when someone scans the QR */
  landingTheme: LandingThemeDb;
  /** Whether to track scans and show analytics for this QR */
  analyticsEnabled: boolean;
};

export type QRLoadForEdit = {
  id: string;
  name?: string;
  contentType: string;
  content: string;
  template?: string;
  landingTheme?: string;
  metadata?: { message?: string; smartRedirect?: { ios?: string; android?: string; fallback?: string } };
  analyticsEnabled?: boolean;
};

export type CreateQRActions = {
  setSelectedType: (type: QRContentType | null) => void;
  setName: (name: string) => void;
  setContent: (content: string) => void;
  setPhoneCountryCode: (dial: string) => void;
  setPhoneMessage: (message: string) => void;
  setSmartRedirectIos: (url: string) => void;
  setSmartRedirectAndroid: (url: string) => void;
  setSmartRedirectFallback: (url: string) => void;
  setSelectedTemplate: (template: QRTemplateId) => void;
  setLandingTheme: (theme: LandingThemeDb) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  /** Load existing QR data for edit mode (prefill form and set editingId). */
  loadForEdit: (qr: QRLoadForEdit) => void;
  /** Reset form and generate a new preview id (e.g. after create or "Start over") */
  reset: () => void;
};

const initialState: CreateQRState = {
  previewQRId: "",
  editingId: null,
  selectedType: null,
  name: "",
  content: "",
  phoneCountryCode: "+1",
  phoneMessage: "",
  smartRedirectIos: "",
  smartRedirectAndroid: "",
  smartRedirectFallback: "",
  selectedTemplate: "classic",
  landingTheme: DEFAULT_LANDING_THEME,
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
      setPhoneCountryCode: (phoneCountryCode) => set({ phoneCountryCode }),
      setPhoneMessage: (phoneMessage) => set({ phoneMessage }),
      setSmartRedirectIos: (smartRedirectIos) => set({ smartRedirectIos }),
      setSmartRedirectAndroid: (smartRedirectAndroid) => set({ smartRedirectAndroid }),
      setSmartRedirectFallback: (smartRedirectFallback) => set({ smartRedirectFallback }),
      setSelectedTemplate: (selectedTemplate) => set({ selectedTemplate }),
      setLandingTheme: (landingTheme) => set({ landingTheme }),
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
      loadForEdit: (qr) => {
        const type = qr.contentType as QRContentType;
        const isPhoneType = type === "phone" || type === "sms" || type === "whatsapp";
        let content = qr.content ?? "";
        let phoneCountryCode = "+1";
        let phoneMessage = (qr.metadata as { message?: string } | undefined)?.message ?? "";
        if (isPhoneType && content.trim()) {
          // Legacy: SMS might have been stored as "number,message" in content
          let numberPart = content.trim();
          if (type === "sms" && numberPart.includes(",")) {
            const [num, ...rest] = numberPart.split(",");
            numberPart = (num ?? "").trim();
            if (rest.length && !phoneMessage) phoneMessage = rest.join(",").trim();
          }
          const parsed = parseDialFromFullNumber(numberPart);
          phoneCountryCode = parsed.dial;
          content = parsed.national;
        }
        const meta = qr.metadata as { message?: string; smartRedirect?: { ios?: string; android?: string; fallback?: string } } | undefined;
        const smartRedirect = meta?.smartRedirect;
        set({
          editingId: qr.id,
          previewQRId: qr.id,
          name: qr.name ?? "",
          selectedType: type,
          content,
          phoneCountryCode,
          phoneMessage,
          smartRedirectIos: smartRedirect?.ios ?? "",
          smartRedirectAndroid: smartRedirect?.android ?? "",
          smartRedirectFallback: smartRedirect?.fallback ?? content ?? "",
          selectedTemplate: (qr.template as QRTemplateId) ?? "classic",
          landingTheme: (qr.landingTheme as LandingThemeDb) ?? DEFAULT_LANDING_THEME,
          analyticsEnabled: qr.analyticsEnabled ?? true,
        });
      },
      reset: () => set(getInitialState()),
    }),
    {
      name: "useqr-create-draft",
      partialize: (s) => ({
        selectedType: s.selectedType,
        name: s.name,
        content: s.content,
        phoneCountryCode: s.phoneCountryCode,
        phoneMessage: s.phoneMessage,
        smartRedirectIos: s.smartRedirectIos,
        smartRedirectAndroid: s.smartRedirectAndroid,
        smartRedirectFallback: s.smartRedirectFallback,
        selectedTemplate: s.selectedTemplate,
        landingTheme: s.landingTheme,
        analyticsEnabled: s.analyticsEnabled,
      }),
      // Don't persist previewQRId — fresh per session; draft fields restore on revisit
    }
  )
);
