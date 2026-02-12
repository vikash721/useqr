import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { buildQRData, generateQRId, getCardBaseUrl } from "@/lib/qr";
import {
  ensureQRIndexes,
  createQR,
  listQRsByClerk,
  countQRsByClerk,
} from "@/lib/db/qrs";
import { qrCreateBodySchema } from "@/lib/db/schemas/qr";

/**
 * POST /api/qrs
 * Create a new QR. Auth required. Body: name, contentType, content, template, analyticsEnabled, status.
 * Server sets _id, clerkId, payload, createdAt, updatedAt, scanCount.
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

  const parsed = qrCreateBodySchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, contentType, content, message, template, landingTheme, analyticsEnabled, status } =
    parsed.data;

  const baseUrl = getCardBaseUrl();
  const _id = generateQRId();
  const payload = buildQRData(contentType, content, { baseUrl, qrId: _id, message });

  const metadata =
    message !== undefined && message !== ""
      ? { message: message.trim() }
      : undefined;

  try {
    await ensureQRIndexes();
    const doc = await createQR({
      _id,
      clerkId: user.id,
      name,
      contentType,
      content,
      payload,
      template,
      landingTheme,
      analyticsEnabled,
      status,
      ...(metadata ? { metadata } : {}),
    });

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
      },
    });
  } catch (err) {
    console.error("[POST /api/qrs]", err);
    return NextResponse.json(
      { error: "Failed to create QR" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/qrs
 * List current user's QRs, newest first. Auth required.
 * Query: limit (default 50, max 100), skip (default 0).
 */
export async function GET(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const limit = Math.min(
    Math.max(1, parseInt(searchParams.get("limit") ?? "50", 10)),
    100
  );
  const skip = Math.max(0, parseInt(searchParams.get("skip") ?? "0", 10));

  try {
    const [list, total] = await Promise.all([
      listQRsByClerk(user.id, { limit, skip }),
      countQRsByClerk(user.id),
    ]);

    const qrs = list.map((doc) => ({
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
    }));

    return NextResponse.json({ qrs, total });
  } catch (err) {
    console.error("[GET /api/qrs]", err);
    return NextResponse.json(
      { error: "Failed to list QRs" },
      { status: 500 }
    );
  }
}
