import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getAllUsers } from "@/lib/db/users";

/**
 * GET /api/users
 * Returns all registered users (waitlist) for display. Authenticated only.
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
      email: u.email ?? null,
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
