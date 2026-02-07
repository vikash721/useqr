import { z } from "zod";

/**
 * User document schema for MongoDB.
 * Synced from Clerk; all identity fields mirror Clerk for a single source of truth.
 * UseQR-specific fields (plan, limits) live here for billing and product logic.
 */

export const USERS_COLLECTION = "users" as const;

export const planSlugSchema = z.enum(["free", "starter", "pro", "business"]);
export type PlanSlug = z.infer<typeof planSlugSchema>;

/** Zod schema for validating user documents (e.g. API input or DB reads). */
export const userDocumentSchema = z.object({
  clerkId: z.string().min(1),
  email: z.string().email().nullable(),
  emailVerified: z.boolean(),
  firstName: z.string().nullable(),
  lastName: z.string().nullable(),
  name: z.string().nullable(),
  imageUrl: z.string().nullable(),
  createdAt: z.coerce.date(),
  updatedAt: z.coerce.date(),
  lastSignInAt: z.coerce.date().nullable(),
  plan: planSlugSchema.default("free"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/** User document type inferred from Zod schema. */
export type UserDocument = z.infer<typeof userDocumentSchema>;

/** Input for upsert: same as UserDocument but createdAt/updatedAt are optional (set by DB). */
export type UserUpsertInput = Omit<UserDocument, "createdAt" | "updatedAt"> & {
  createdAt?: Date;
  updatedAt?: Date;
};
