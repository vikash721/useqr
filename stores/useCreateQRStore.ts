"use client";

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { generateQRId } from "@/lib/qr";
import type { QRTemplateId } from "@/lib/qr";
import type { QRContentType } from "@/lib/qr/payload";
import type { VCardFields } from "@/lib/qr/vcard";
import type { WifiFields, WifiSecurity } from "@/lib/qr/wifi";
import type { EventFields } from "@/lib/qr/event";
import { parseVCard } from "@/lib/qr/vcard";
import { parseWifiString } from "@/lib/qr/wifi";
import { parseEventString } from "@/lib/qr/event";
import type { LandingThemeDb } from "@/lib/db/schemas/qr";
import { DEFAULT_LANDING_THEME } from "@/lib/qr/landing-theme";
import type { QRStyle } from "@/lib/qr/qr-style";
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
  /** vCard fields (when type is vcard) */
  vcardFields: VCardFields;
  /** vCard lost & found: show "I have lost this item" message on scan when true */
  vcardLostMode: boolean;
  /** vCard lost & found: item description (e.g. bottle, lunchbox) or custom message when lost */
  vcardLostItem: string;
  /** WiFi fields (when type is wifi) */
  wifiFields: WifiFields;
  /** Email fields (when type is email): to, subject, body */
  emailTo: string;
  emailSubject: string;
  emailBody: string;
  /** Event fields (when type is event) */
  eventFields: EventFields;
  /** Template design (classic, rounded, dots, etc.) */
  selectedTemplate: QRTemplateId;
  /** Full QR style overrides (colors, logo, shapes). Merged with template for rendering. */
  qrStyle: Partial<QRStyle>;
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
  style?: Partial<QRStyle>;
  landingTheme?: string;
  metadata?: {
    message?: string;
    smartRedirect?: { ios?: string; android?: string; fallback?: string };
    email?: { subject?: string; body?: string };
    vcardLostMode?: boolean;
    vcardLostItem?: string;
  };
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
  setVcardFields: (f: Partial<VCardFields>) => void;
  setVcardLostMode: (enabled: boolean) => void;
  setVcardLostItem: (item: string) => void;
  setWifiFields: (f: Partial<WifiFields>) => void;
  setEmailTo: (v: string) => void;
  setEmailSubject: (v: string) => void;
  setEmailBody: (v: string) => void;
  setEventFields: (f: Partial<EventFields>) => void;
  setSelectedTemplate: (template: QRTemplateId) => void;
  /** Merge style overrides (colors, logo, shapes). Pass partial updates. */
  setQRStyle: (updates: Partial<QRStyle>) => void;
  /** Reset QR style to template only (clear custom colors/logo). */
  resetQRStyle: () => void;
  setLandingTheme: (theme: LandingThemeDb) => void;
  setAnalyticsEnabled: (enabled: boolean) => void;
  /** Load existing QR data for edit mode (prefill form and set editingId). */
  loadForEdit: (qr: QRLoadForEdit) => void;
  /** Set preview QR id (used after mount to avoid SSR/client hydration mismatch). */
  setPreviewQRId: (id: string) => void;
  /** Reset form and generate a new preview id (e.g. after create or "Start over") */
  reset: () => void;
};

const defaultVcard: VCardFields = { firstName: "", lastName: "", organization: "", phone: "", email: "" };
const defaultWifi: WifiFields = { ssid: "", password: "", security: "WPA" };
const defaultEvent: EventFields = { title: "", start: "", end: "", location: "", description: "" };

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
  vcardFields: defaultVcard,
  vcardLostMode: false,
  vcardLostItem: "",
  wifiFields: defaultWifi,
  emailTo: "",
  emailSubject: "",
  emailBody: "",
  eventFields: defaultEvent,
  selectedTemplate: "classic",
  qrStyle: {},
  landingTheme: DEFAULT_LANDING_THEME,
  analyticsEnabled: true,
};

/** Initial state for store; previewQRId is left empty so server and client match (set on client after mount). */
function getInitialState(): CreateQRState {
  return {
    ...initialState,
    previewQRId: "",
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
      setVcardFields: (f) => set((s) => ({ vcardFields: { ...s.vcardFields, ...f } })),
      setVcardLostMode: (vcardLostMode) => set({ vcardLostMode }),
      setVcardLostItem: (vcardLostItem) => set({ vcardLostItem }),
      setWifiFields: (f) => set((s) => ({ wifiFields: { ...s.wifiFields, ...f } })),
      setEmailTo: (emailTo) => set({ emailTo }),
      setEmailSubject: (emailSubject) => set({ emailSubject }),
      setEmailBody: (emailBody) => set({ emailBody }),
      setEventFields: (f) => set((s) => ({ eventFields: { ...s.eventFields, ...f } })),
      setSelectedTemplate: (selectedTemplate) => set((s) => ({ selectedTemplate, qrStyle: { ...s.qrStyle, template: selectedTemplate } })),
      setQRStyle: (updates) => set((s) => ({ qrStyle: { ...s.qrStyle, ...updates } })),
      resetQRStyle: () => set({ qrStyle: {} }),
      setLandingTheme: (landingTheme) => set({ landingTheme }),
      setAnalyticsEnabled: (analyticsEnabled) => set({ analyticsEnabled }),
      setPreviewQRId: (previewQRId) => set({ previewQRId }),
      loadForEdit: (qr) => {
        const type = qr.contentType as QRContentType;
        const meta = qr.metadata as {
          message?: string;
          smartRedirect?: { ios?: string; android?: string; fallback?: string };
          email?: { subject?: string; body?: string };
          vcardLostMode?: boolean;
          vcardLostItem?: string;
        } | undefined;
        const isPhoneType = type === "phone" || type === "sms" || type === "whatsapp";
        let content = qr.content ?? "";
        let phoneCountryCode = "+1";
        let phoneMessage = meta?.message ?? "";
        let vcardFields = defaultVcard;
        let wifiFields = defaultWifi;
        let emailTo = "";
        let emailSubject = "";
        let emailBody = "";
        let eventFields = defaultEvent;

        if (isPhoneType && content.trim()) {
          let numberPart = content.trim();
          if (type === "sms" && numberPart.includes(",")) {
            const [num, ...rest] = numberPart.split(",");
            numberPart = (num ?? "").trim();
            if (rest.length && !phoneMessage) phoneMessage = rest.join(",").trim();
          }
          const parsed = parseDialFromFullNumber(numberPart);
          phoneCountryCode = parsed.dial;
          content = parsed.national;
        } else if (type === "vcard" && content.trim()) {
          const parsed = parseVCard(content);
          vcardFields = { ...defaultVcard, ...parsed };
        }
        const vcardLostMode = meta?.vcardLostMode === true;
        const vcardLostItem = (meta?.vcardLostItem as string)?.trim() ?? "";
        if (type === "wifi" && content.trim()) {
          const parsed = parseWifiString(content);
          wifiFields = { ...defaultWifi, ...parsed };
        } else if (type === "email" && content.trim()) {
          const raw = content.trim();
          if (raw.startsWith("mailto:")) {
            try {
              const url = new URL(raw);
              emailTo = url.pathname.trim();
              emailSubject = url.searchParams.get("subject") ?? "";
              emailBody = url.searchParams.get("body") ?? "";
            } catch {
              emailTo = raw.replace(/^mailto:/, "").split("?")[0].trim();
            }
          } else {
            emailTo = raw;
          }
          if (meta?.email?.subject != null) emailSubject = meta.email.subject;
          if (meta?.email?.body != null) emailBody = meta.email.body;
        } else if (type === "event" && content.trim()) {
          const parsed = parseEventString(content);
          if (parsed) eventFields = { ...defaultEvent, ...parsed };
        }

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
          vcardFields,
          vcardLostMode,
          vcardLostItem,
          wifiFields,
          emailTo,
          emailSubject,
          emailBody,
          eventFields,
          selectedTemplate: (qr.template as QRTemplateId) ?? "classic",
          qrStyle: (qr.style as Partial<QRStyle>) ?? {},
          landingTheme: (qr.landingTheme as LandingThemeDb) ?? DEFAULT_LANDING_THEME,
          analyticsEnabled: qr.analyticsEnabled ?? true,
        });
      },
      reset: () => set({ ...getInitialState(), previewQRId: generateQRId() }),
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
        vcardFields: s.vcardFields,
        vcardLostMode: s.vcardLostMode,
        vcardLostItem: s.vcardLostItem,
        wifiFields: s.wifiFields,
        emailTo: s.emailTo,
        emailSubject: s.emailSubject,
        emailBody: s.emailBody,
        eventFields: s.eventFields,
        selectedTemplate: s.selectedTemplate,
        qrStyle: s.qrStyle,
        landingTheme: s.landingTheme,
        analyticsEnabled: s.analyticsEnabled,
      }),
      // Don't persist previewQRId — fresh per session; draft fields restore on revisit
    }
  )
);
