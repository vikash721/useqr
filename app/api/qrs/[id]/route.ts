import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { buildQRData, getCardBaseUrl } from "@/lib/qr";
import { deleteScanEventsByQrId } from "@/lib/db/analytics";
import { getClient } from "@/lib/db/mongodb";
import {
  getQRByIdAndClerk,
  updateQR,
  deleteQR,
  type QRUpdateInput,
} from "@/lib/db/qrs";
import { qrUpdateBodySchema } from "@/lib/db/schemas/qr";

type RouteContext = { params: Promise<{ id: string }> };

/**
 * GET /api/qrs/[id]
 * Get a single QR by id. Auth required; returns 404 if not found or not owned.
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

    return NextResponse.json({
      qr: {
        id: doc._id,
        name: doc.name,
        contentType: doc.contentType,
        content: doc.content,
        payload: doc.payload,
        template: doc.template,
        landingTheme: doc.landingTheme ?? "default",
        analyticsEnabled: doc.analyticsEnabled,
        status: doc.status,
        scanCount: doc.scanCount,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        ...(doc.metadata ? { metadata: doc.metadata } : {}),
        ...(doc.style ? { style: doc.style } : {}),
      },
    });
  } catch (err) {
    console.error("[GET /api/qrs/[id]]", err);
    return NextResponse.json(
      { error: "Failed to get QR" },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/qrs/[id]
 * Update a QR. Auth required; only owner can update. Recomputes payload if contentType or content change.
 */
export async function PATCH(request: Request, context: RouteContext) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body" },
      { status: 400 }
    );
  }

  const parsed = qrUpdateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  try {
    const existing = await getQRByIdAndClerk(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: "QR not found" }, { status: 404 });
    }

    const isContentChange =
      parsed.data.contentType !== undefined ||
      parsed.data.content !== undefined ||
      parsed.data.message !== undefined;

    let update: QRUpdateInput;
    if (isContentChange) {
      const contentType = parsed.data.contentType ?? existing.contentType;
      const content = parsed.data.content ?? existing.content;
      const message = parsed.data.message;
      const baseUrl = getCardBaseUrl();
      const payload = buildQRData(contentType, content, { baseUrl, qrId: id, message });
      update = { ...parsed.data, payload };
    } else {
      update = { ...parsed.data };
    }

    const doc = await updateQR(id, user.id, update);
    if (!doc) {
      return NextResponse.json({ error: "QR not found" }, { status: 404 });
    }

    return NextResponse.json({
      ok: true,
      qr: {
        id: doc._id,
        name: doc.name,
        contentType: doc.contentType,
        content: doc.content,
        payload: doc.payload,
        template: doc.template,
        landingTheme: doc.landingTheme ?? "default",
        analyticsEnabled: doc.analyticsEnabled,
        status: doc.status,
        scanCount: doc.scanCount,
        createdAt: doc.createdAt.toISOString(),
        updatedAt: doc.updatedAt.toISOString(),
        ...(doc.metadata ? { metadata: doc.metadata } : {}),
        ...(doc.style ? { style: doc.style } : {}),
      },
    });
  } catch (err) {
    console.error("[PATCH /api/qrs/[id]]", err);
    return NextResponse.json(
      { error: "Failed to update QR" },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/qrs/[id]
 * Delete a QR. Auth required; only owner can delete.
 */
export async function DELETE(_request: Request, context: RouteContext) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await context.params;
  if (!id) {
    return NextResponse.json({ error: "Missing id" }, { status: 400 });
  }

  try {
    const existing = await getQRByIdAndClerk(id, user.id);
    if (!existing) {
      return NextResponse.json({ error: "QR not found" }, { status: 404 });
    }

    const client = getClient();
    const session = client.startSession();
    try {
      await session.withTransaction(async () => {
        await deleteScanEventsByQrId(id, session);
        const deleted = await deleteQR(id, user.id, session);
        if (!deleted) {
          throw new Error("QR not found");
        }
      });
    } catch (txErr) {
      const isTransactionError =
        txErr instanceof Error &&
        (txErr.message === "QR not found" ||
          /transaction|replica set|not supported/i.test(txErr.message));
      if (isTransactionError && txErr instanceof Error && txErr.message === "QR not found") {
        return NextResponse.json({ error: "QR not found" }, { status: 404 });
      }
      if (txErr instanceof Error && /transaction|replica set|not supported/i.test(txErr.message)) {
        await session.endSession().catch(() => {});
        await deleteScanEventsByQrId(id);
        const deleted = await deleteQR(id, user.id);
        if (!deleted) {
          return NextResponse.json({ error: "QR not found" }, { status: 404 });
        }
        return NextResponse.json({ ok: true });
      }
      throw txErr;
    } finally {
      await session.endSession().catch(() => {});
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/qrs/[id]]", err);
    return NextResponse.json(
      { error: "Failed to delete QR" },
      { status: 500 }
    );
  }
}
