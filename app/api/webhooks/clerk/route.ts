import { type NextRequest, NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { deleteAllUserDataByClerkId } from "@/lib/db/delete-user-data";
import { sendDeletionReportEmail } from "@/lib/email";

/**
 * GET /api/webhooks/clerk
 * Health/verification (e.g. Svix sends GET). Return 200 so GET is not redirected; helps debug 307.
 */
export async function GET(request: NextRequest) {
  console.log("[webhooks/clerk] GET received", {
    path: request.nextUrl.pathname,
    url: request.url,
    host: request.headers.get("host"),
  });
  return NextResponse.json({ ok: true, method: "GET" }, { status: 200 });
}

/**
 * POST /api/webhooks/clerk
 * Clerk webhook endpoint. Verify signature, then handle user.deleted (delete user from our DB).
 * Set CLERK_WEBHOOK_SIGNING_SECRET in production (avoid NEXT_PUBLIC_ so the secret isn't exposed to the client).
 */
export async function POST(request: NextRequest) {
  console.log("[webhooks/clerk] POST received", {
    path: request.nextUrl.pathname,
    url: request.url,
    host: request.headers.get("host"),
  });

  const signingSecret =
    process.env.CLERK_WEBHOOK_SIGNING_SECRET ||
    process.env.NEXT_PUBLIC_CLERK_WEBHOOK_SECRET;

  if (!signingSecret) {
    console.error("[webhooks/clerk] Missing webhook signing secret");
    return NextResponse.json(
      { error: "Webhook not configured" },
      { status: 500 }
    );
  }

  try {
    const evt = await verifyWebhook(request, { signingSecret });
    console.log("[webhooks/clerk] Verified event", { type: evt.type, id: evt.data?.id });

    if (evt.type === "user.deleted") {
      const clerkId = evt.data.id;
      if (clerkId) {
        const result = await deleteAllUserDataByClerkId(clerkId);
        console.log("[webhooks/clerk] user.deleted handled", { clerkId, ...result });
        const emailResult = await sendDeletionReportEmail(clerkId, result);
        if (!emailResult.success) {
          console.error("[webhooks/clerk] Deletion report email failed", {
            clerkId,
            error: emailResult.error,
          });
        }
      }
    }

    console.log("[webhooks/clerk] Returning 200");
    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[webhooks/clerk] Verification or handler error", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }
}
