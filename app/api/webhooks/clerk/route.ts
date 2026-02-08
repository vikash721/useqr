import { NextResponse } from "next/server";
import { verifyWebhook } from "@clerk/nextjs/webhooks";
import { deleteUserByClerkId } from "@/lib/db/users";

/**
 * POST /api/webhooks/clerk
 * Clerk webhook endpoint. Verify signature, then handle user.deleted (delete user from our DB).
 * Set CLERK_WEBHOOK_SIGNING_SECRET in production (avoid NEXT_PUBLIC_ so the secret isn't exposed to the client).
 */
export async function POST(request: Request) {
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

    if (evt.type === "user.deleted") {
      const clerkId = evt.data.id;
      if (clerkId) {
        await deleteUserByClerkId(clerkId);
      }
    }

    return NextResponse.json({ received: true }, { status: 200 });
  } catch (err) {
    console.error("[webhooks/clerk]", err);
    return NextResponse.json(
      { error: "Webhook verification failed" },
      { status: 400 }
    );
  }
}
