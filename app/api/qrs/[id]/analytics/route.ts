import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getScanAnalytics } from "@/lib/db/analytics";
import { getQRByIdAndClerk } from "@/lib/db/qrs";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/qrs/[id]/analytics
 * Returns scan analytics for a QR. Auth required; 404 if not found or not owned.
 */
export async function GET(_request: Request, context: RouteContext) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const doc = await getQRByIdAndClerk(id, user.id);
    if (!doc) {
      return NextResponse.json({ error: "QR not found" }, { status: 404 });
    }

    const { lastScannedAt, scansByDay } = await getScanAnalytics(
      id,
      doc.createdAt
    );

    return NextResponse.json({
      qr: {
        id: doc._id,
        name: doc.name,
        contentType: doc.contentType,
        createdAt: doc.createdAt.toISOString(),
        scanCount: doc.scanCount,
      },
      lastScannedAt,
      scansByDay,
    });
  } catch (err) {
    console.error("[GET /api/qrs/[id]/analytics]", err);
    return NextResponse.json(
      { error: "Failed to load analytics" },
      { status: 500 }
    );
  }
}
