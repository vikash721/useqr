import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { upsertUserFromClerk } from "@/lib/db/users";

/**
 * POST /api/users/sync
 * Syncs the current Clerk user to our DB. Call after login/signup (or on app load when signed in).
 * Returns 401 if not signed in; 200 with synced user summary on success.
 */
export async function POST() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await upsertUserFromClerk(clerkUser);
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
