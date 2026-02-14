import { currentUser } from "@clerk/nextjs/server";
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isAdminUser } from "@/lib/admin";
import {
  getAllWhitelistedEmails,
  addEmailToWhitelist,
  removeEmailFromWhitelist,
} from "@/lib/db/payment-whitelist";

/**
 * Get all whitelisted emails (admin only)
 * GET /api/payment-whitelist
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const whitelist = await getAllWhitelistedEmails();
    return NextResponse.json({ whitelist });
  } catch (error) {
    console.error("Error fetching whitelist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const addEmailSchema = z.object({
  email: z.string().email(),
  reason: z.string().optional(),
});

/**
 * Add email to whitelist (admin only)
 * POST /api/payment-whitelist
 */
export async function POST(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email, reason } = addEmailSchema.parse(body);

    await addEmailToWhitelist(email, user.id, reason);

    return NextResponse.json({ 
      message: "Email added to whitelist successfully",
      email 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    if (error instanceof Error && error.message === "Email is already whitelisted") {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    console.error("Error adding to whitelist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

const deleteEmailSchema = z.object({
  email: z.string().email(),
});

/**
 * Remove email from whitelist (admin only)
 * DELETE /api/payment-whitelist
 */
export async function DELETE(req: NextRequest) {
  try {
    const user = await currentUser();
    if (!user || !isAdminUser(user)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { email } = deleteEmailSchema.parse(body);

    await removeEmailFromWhitelist(email);

    return NextResponse.json({ 
      message: "Email removed from whitelist successfully" 
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors }, { status: 400 });
    }
    console.error("Error removing from whitelist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
