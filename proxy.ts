import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboard = createRouteMatcher(["/dashboard(.*)"]);
/** Landing page and auth pages — redirect to /dashboard if already signed in */
const isLandingOrAuth = createRouteMatcher(["/", "/login", "/signup", "/forgot-password"]);
/** Clerk webhook — must be public (no auth); Clerk sends server-to-server POST */
const isWebhook = createRouteMatcher(["/api/webhooks/clerk"]);

/**
 * - Signed in + visiting /, /login, or /signup → redirect to /dashboard
 * - Not signed in + visiting /dashboard → redirect to /login?redirect=/dashboard
 * - Otherwise allow
 *
 * CSP (including img-src for ImageKit logos) is set in next.config.ts.
 */
export default clerkMiddleware(
  async (auth, req) => {
    if (isWebhook(req)) {
      return NextResponse.next();
    }

    const { isAuthenticated } = await auth();
    const url = req.nextUrl.clone();

    if (isAuthenticated && isLandingOrAuth(req)) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isDashboard(req) && !isAuthenticated) {
      url.pathname = "/login";
      url.searchParams.set("redirect", "/dashboard");
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  }
);
