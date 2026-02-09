import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getAllUsers } from "@/lib/db/users";

/** Mask email server-side so the full address is never sent to the client. */
function maskEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "***";
  const local = email.slice(0, at);
  const domain = email.slice(at);
  if (local.length === 0) return "***" + domain;
  return local[0] + "***" + domain;
}

/**
 * GET /api/users
 * Returns all registered users (waitlist) for display. Authenticated only.
 * Emails are masked server-side (e.g. a***@example.com) for privacy.
 * Returns 401 if not signed in; 200 with { users: [...] } on success.
 */
export async function GET() {
  const clerkUser = await currentUser();
  if (!clerkUser) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const list = await getAllUsers();
    const users = list.map((u) => ({
      id: (u as { _id?: unknown })._id?.toString?.() ?? u.clerkId,
      name: u.name ?? null,
      email: u.email ? maskEmail(u.email) : null,
      imageUrl: u.imageUrl ?? null,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    }));
    return NextResponse.json({ users });
  } catch (err) {
    console.error("[users GET]", err);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}
