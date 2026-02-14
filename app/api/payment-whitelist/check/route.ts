import { currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { isEmailWhitelisted } from "@/lib/db/payment-whitelist";

/**
 * Check if current user's email is whitelisted for payments
 * GET /api/payment-whitelist/check
 */
export async function GET() {
  try {
    const user = await currentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    if (!email) {
      return NextResponse.json({ error: "No email found" }, { status: 400 });
    }

    const isWhitelisted = await isEmailWhitelisted(email);
    
    return NextResponse.json({ 
      isWhitelisted,
      email 
    });
  } catch (error) {
    console.error("Error checking whitelist:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
