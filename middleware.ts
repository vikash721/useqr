import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboard = createRouteMatcher(["/dashboard(.*)"]);
/** Landing page and auth pages — redirect to /dashboard if already signed in */
const isLandingOrAuth = createRouteMatcher(["/", "/login", "/signup", "/forgot-password"]);

/**
 * - Signed in + visiting /, /login, or /signup → redirect to /dashboard
 * - Not signed in + visiting /dashboard → redirect to sign-in (e.g. /login)
 * - Otherwise allow
 *
 * contentSecurityPolicy: {} enables Clerk's default CSP so Smart CAPTCHA
 * (Cloudflare Turnstile) can load: frame-src and script-src include
 * https://challenges.cloudflare.com. A 401 on challenges.cloudflare.com
 * for /cdn-cgi/challenge-platform/h/b/pat/... is expected (Private Access
 * Token probe) and does not mean the CAPTCHA failed.
 */
export default clerkMiddleware(
  async (auth, req) => {
    const { isAuthenticated } = await auth();
    const url = req.nextUrl.clone();

    if (isAuthenticated && isLandingOrAuth(req)) {
      url.pathname = "/dashboard";
      return NextResponse.redirect(url);
    }

    if (isDashboard(req)) {
      await auth.protect();
    }

    return NextResponse.next();
  },
  {
    contentSecurityPolicy: {
      directives: {
        // qr-code-styling internally renders the QR as an SVG data-URI loaded
        // into an <img> before drawing to canvas. Without "data:" and "blob:"
        // here, the browser's CSP blocks that load and the QR never appears.
        // Giphy GIF in MissionPassedModal
        "img-src": ["data:", "blob:", "https://media2.giphy.com", "https://*.giphy.com"],
      },
    },
  }
);
