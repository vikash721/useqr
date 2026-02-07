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
