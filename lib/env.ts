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
  /** Paddle API key (server-only). For Paddle Billing API and webhooks. */
  PADDLE_API_KEY: z.string().min(1).optional(),
  /** Paddle webhook signing secret. Required for /api/webhooks/paddle. */
  PADDLE_WEBHOOK_SECRET: z.string().min(1).optional(),
  /** Paddle Starter plan price ID (pri_...). Used for checkout and webhook mapping. */
  PADDLE_PRICE_ID_STARTER: z.string().min(1).optional(),
  /** Paddle Pro plan price ID. Optional until you create the product in Paddle. */
  PADDLE_PRICE_ID_PRO: z.string().min(1).optional(),
  /** Paddle Business plan price ID. Optional until you create the product in Paddle. */
  PADDLE_PRICE_ID_BUSINESS: z.string().min(1).optional(),
  /** Paddle client-side token (exposed to browser). Required for Paddle checkout to load. */
  NEXT_PUBLIC_PADDLE_CLIENT_TOKEN: z.string().min(1).optional(),
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
