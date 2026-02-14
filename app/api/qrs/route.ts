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
import { getUserByClerkId } from "@/lib/db/users";
import {
  checkAccess,
  FeatureNotAvailableError,
  LimitExceededError,
  getAccessInfo,
} from "@/lib/plans/access-control";
import {
  createFeatureNotAvailableResponse,
  createLimitExceededResponse,
} from "@/lib/plans/middleware";

/**
 * POST /api/qrs
 * Create a new QR. Auth required. Body: name, contentType, content, template, analyticsEnabled, status.
 * Server sets _id, clerkId, payload, createdAt, updatedAt, scanCount.
 *
 * Plan-based access control:
 * - Checks if user's plan allows creating QRs
 * - Enforces QR code count limits per plan
 */
export async function POST(request: Request) {
  const user = await currentUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get user's plan from database
  const userDoc = await getUserByClerkId(user.id);
  if (!userDoc) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
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

  // Check plan-based feature restrictions
  const { name, contentType, content, message, metadata: bodyMetadata, template, style, landingTheme, analyticsEnabled, status } =
    parsed.data;

  // Validate features based on plan
  const featureValidations = [];

  // Check images/video feature
  if (contentType === "image" || contentType === "video") {
    featureValidations.push({ feature: "imagesAndVideo" as const, required: true });
  }

  // Check smart redirect
  if (bodyMetadata?.smartRedirect) {
    featureValidations.push({ feature: "smartRedirectDevice" as const, required: true });
  }

  // Check scan analytics
  if (analyticsEnabled) {
    featureValidations.push({ feature: "scanAnalytics" as const, required: true });
  }

  // Execute feature validations
  for (const { feature } of featureValidations) {
    try {
      checkAccess({ plan: userDoc.plan }, feature);
    } catch (err) {
      if (err instanceof FeatureNotAvailableError) {
        return createFeatureNotAvailableResponse(userDoc.plan, err.featureKey);
      }
      throw err;
    }
  }

  // Check QR code limit
  try {
    const qrCount = await countQRsByClerk(user.id);
    checkAccess({ plan: userDoc.plan }, "qrCodesIncluded", qrCount);
  } catch (err) {
    if (err instanceof FeatureNotAvailableError) {
      return createFeatureNotAvailableResponse(userDoc.plan, err.featureKey);
    }
    if (err instanceof LimitExceededError) {
      const accessInfo = getAccessInfo(userDoc.plan, "qrCodesIncluded");
      return createLimitExceededResponse(
        "qrCodesIncluded",
        accessInfo.limit!,
        qrCount
      );
    }
    throw err;
  }

  const baseUrl = getCardBaseUrl();
  const _id = generateQRId();
  const payload = buildQRData(contentType, content, { baseUrl, qrId: _id, message });

  const metadata = (() => {
    const base = message !== undefined && message !== "" ? { message: message.trim() } : {};
    return bodyMetadata && Object.keys(bodyMetadata).length > 0 ? { ...base, ...bodyMetadata } : (Object.keys(base).length ? base : undefined);
  })();

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
      ...(style && Object.keys(style).length > 0 ? { style } : {}),
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
        ...(doc.style ? { style: doc.style } : {}),
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
      style: doc.style,
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
