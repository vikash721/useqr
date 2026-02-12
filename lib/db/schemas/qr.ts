import { z } from "zod";

/**
 * QR document schema for MongoDB.
 * Matches create form + payload; used for API validation and DB reads.
 */

export const QRS_COLLECTION = "qrs" as const;

export const qrContentTypeSchema = z.enum([
  "url",
  "vcard",
  "wifi",
  "text",
  "email",
  "sms",
  "phone",
  "location",
  "event",
  "whatsapp",
  "smart_redirect",
]);
export type QRContentTypeDb = z.infer<typeof qrContentTypeSchema>;

export const qrTemplateSchema = z.enum([
  "classic",
  "rounded",
  "dots",
  "minimal",
  "branded",
]);
export type QRTemplateDb = z.infer<typeof qrTemplateSchema>;

/** Landing page theme when someone scans the QR (e.g. default, minimal, card, full). */
export const landingThemeSchema = z.enum([
  "default",
  "minimal",
  "card",
  "full",
]);
export type LandingThemeDb = z.infer<typeof landingThemeSchema>;

export const qrStatusSchema = z.enum(["draft", "active", "archived"]);
export type QRStatus = z.infer<typeof qrStatusSchema>;

/** Full document as stored in DB (with _id and dates). */
export const qrDocumentSchema = z.object({
  _id: z.string().min(1).max(64),
  clerkId: z.string().min(1),
  name: z.string().max(512).default(""),
  contentType: qrContentTypeSchema,
  content: z.string(),
  payload: z.string(),
  template: qrTemplateSchema.default("classic"),
  landingTheme: landingThemeSchema.default("default"),
  analyticsEnabled: z.boolean().default(true),
  status: qrStatusSchema.default("active"),
  scanCount: z.number().int().min(0).default(0),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

export type QRDocument = z.infer<typeof qrDocumentSchema>;

/** Input for creating a QR (API body); server sets _id, clerkId, payload, dates, scanCount. */
export const qrCreateBodySchema = z.object({
  name: z.string().max(512).default(""),
  contentType: qrContentTypeSchema,
  content: z.string(),
  /** Optional message for SMS (body) or WhatsApp (pre-filled text). Stored in metadata.message. */
  message: z.string().max(1000).optional(),
  /** Optional metadata (e.g. smartRedirect: { ios, android, fallback }). */
  metadata: z.record(z.string(), z.unknown()).optional(),
  template: qrTemplateSchema.default("classic"),
  landingTheme: landingThemeSchema.default("default"),
  analyticsEnabled: z.boolean().default(true),
  status: qrStatusSchema.default("active"),
});

export type QRCreateBody = z.infer<typeof qrCreateBodySchema>;

/** Input for updating a QR (API body); only allowed fields. */
export const qrUpdateBodySchema = z.object({
  name: z.string().max(512).optional(),
  contentType: qrContentTypeSchema.optional(),
  content: z.string().optional(),
  message: z.string().max(1000).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  template: qrTemplateSchema.optional(),
  landingTheme: landingThemeSchema.optional(),
  analyticsEnabled: z.boolean().optional(),
  status: qrStatusSchema.optional(),
});

export type QRUpdateBody = z.infer<typeof qrUpdateBodySchema>;
