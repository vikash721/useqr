import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/admin";
import { deleteAllUserDataByClerkId } from "@/lib/db/delete-user-data";
import { getAllUsers } from "@/lib/db/users";
import { sendDeletionReportEmail } from "@/lib/email";

/**
 * GET /api/manage-users
 * Returns all users with clerkId and email. Admin only (hardcoded admin email).
 */
export async function GET() {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const list = await getAllUsers();
    const users = list.map((u) => ({
      clerkId: u.clerkId,
      email: u.email ?? null,
      name: u.name ?? null,
      imageUrl: u.imageUrl ?? null,
      plan: u.plan ?? "free",
      createdAt:
        u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
    }));
    return NextResponse.json({ users });
  } catch (err) {
    console.error("[manage-users GET]", err);
    return NextResponse.json(
      { error: "Failed to load users" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/manage-users
 * Body: { clerkId: string }. Deletes all data for that user from the DB. Admin only.
 * Sends deletion report email after deletion.
 */
export async function DELETE(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isAdminUser(user)) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  let body: { clerkId?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const clerkId =
    typeof body.clerkId === "string" ? body.clerkId.trim() : undefined;
  if (!clerkId) {
    return NextResponse.json(
      { error: "Missing clerkId in body" },
      { status: 400 }
    );
  }

  try {
    const result = await deleteAllUserDataByClerkId(clerkId);
    const emailResult = await sendDeletionReportEmail(clerkId, result);
    if (!emailResult.success) {
      console.error("[manage-users DELETE] Report email failed", emailResult.error);
    }
    return NextResponse.json({
      ok: true,
      ...result,
      reportEmailSent: emailResult.success,
    });
  } catch (err) {
    console.error("[manage-users DELETE]", err);
    return NextResponse.json(
      { error: "Failed to delete user data" },
      { status: 500 }
    );
  }
}
