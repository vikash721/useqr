import type { User } from "@clerk/nextjs/server";

/** Hardcoded admin email. Only this user can access /manage-users and delete users from the DB. */
export const ADMIN_EMAIL = "vikashkumar355555@gmail.com";
// export const ADMIN_EMAIL = "your_email+clerk_test@example.com";

/**
 * Returns true if the given Clerk user is the admin (by primary email).
 */
export function isAdminUser(user: User | null): boolean {
  if (!user) return false;
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses?.[0]?.emailAddress;
  return email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
}
