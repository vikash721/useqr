import { z } from "zod";

/**
 * Validate required env at runtime. Use in server code (e.g. API routes, getDb).
 * Optional vars can be added with .optional() or a separate schema.
 */
const serverEnvSchema = z.object({
  MONGODB_URI: z.string().min(1, "MONGODB_URI is required"),
  CLERK_SECRET_KEY: z.string().min(1, "CLERK_SECRET_KEY is required"),
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY: z
    .string()
    .min(1, "NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY is required"),
  /** Clerk webhook signing secret (whsec_...). Prefer CLERK_WEBHOOK_SIGNING_SECRET over NEXT_PUBLIC_ so the secret isn't exposed to the client. */
  CLERK_WEBHOOK_SIGNING_SECRET: z.string().min(1).optional(),
  /** Telegram Bot API token. Required only for /api/telegram/send. */
  TELEGRAM_BOT_TOKEN: z.string().min(1).optional(),
  /** Telegram chat ID where the bot sends messages. Required only for /api/telegram/send. */
  TELEGRAM_CHAT_ID: z.string().min(1).optional(),
  /** Resend API key. Required for sending transactional email (welcome, waitlist). */
  RESEND_API_KEY: z.string().min(1).optional(),
  /** ImageKit URL endpoint (e.g. https://ik.imagekit.io/useqr). Required for /api/upload. */
  IMAGEKIT_URL_ENDPOINT: z.string().min(1).optional(),
  /** ImageKit public key. Optional; used for URL building. */
  IMAGEKIT_PUBLIC_KEY: z.string().min(1).optional(),
  /** ImageKit private key. Required for server-side uploads in /api/upload. */
  IMAGEKIT_PRIVATE_KEY: z.string().min(1).optional(),
});

export type ServerEnv = z.infer<typeof serverEnvSchema>;

/**
 * Parse and return validated server env. Throws ZodError if invalid.
 * Call once at app startup or lazily in server code.
 */
export function getServerEnv(): ServerEnv {
  return serverEnvSchema.parse(process.env);
}

/**
 * Safe parse: returns { success: true, data } or { success: false, error }.
 */
export function parseServerEnv() {
  return serverEnvSchema.safeParse(process.env);
}
