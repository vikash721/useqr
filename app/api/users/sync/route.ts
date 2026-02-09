import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { upsertUserFromClerk } from "@/lib/db/users";
import { sendWelcomeEmail } from "@/lib/email";

/**
 * POST /api/users/sync
 * Syncs the current Clerk user to our DB. Call after login/signup (or on app load when signed in).
 * On first signup (created), sends welcome email (thanks for signup + waitlist confirmation).
 * Returns 401 if not signed in; 200 with synced user summary on success.
 */
export async function POST() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { user, created } = await upsertUserFromClerk(clerkUser);

    if (created && user.email) {
      const result = await sendWelcomeEmail(user.email, user.name);
      if (!result.success) {
        console.warn("[users/sync] Welcome email failed:", result.error);
      }
    }

    return NextResponse.json({
      ok: true,
      user: {
        clerkId: user.clerkId,
        email: user.email,
        name: user.name,
        imageUrl: user.imageUrl,
        plan: user.plan,
        createdAt: user.createdAt?.toISOString?.(),
      },
    });
  } catch (err) {
    console.error("[users/sync]", err);
    return NextResponse.json(
      { error: "Failed to sync user" },
      { status: 500 }
    );
  }
}
