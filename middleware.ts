import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isDashboard = createRouteMatcher(["/dashboard(.*)"]);
const isManageUsers = createRouteMatcher(["/manage-users(.*)"]);
/** Landing page and auth pages — redirect to /dashboard if already signed in */
const isLandingOrAuth = createRouteMatcher(["/", "/login", "/signup", "/forgot-password"]);
/** Webhooks — must be public (no auth); external services send server-to-server POST */
const isWebhook = createRouteMatcher(["/api/webhooks/clerk", "/api/webhooks/paddle"]);

/**
 * - Signed in + visiting /, /login, or /signup → redirect to /dashboard
 * - Not signed in + visiting /dashboard → redirect to /login?redirect=/dashboard
 * - Otherwise allow
 *
 * CSP is enforced via the `contentSecurityPolicy` option below (Clerk, Paddle, Clarity, maps, etc.).
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

    if ((isDashboard(req) || isManageUsers(req)) && !isAuthenticated) {
      url.pathname = "/login";
      url.searchParams.set("redirect", req.nextUrl.pathname);
      return NextResponse.redirect(url);
    }

    return NextResponse.next();
  },
  {
    contentSecurityPolicy: {
      directives: {
        "connect-src": [
          "'self'",
          // ── Clerk (auth API, session tokens, websocket keep-alive) ──────────
          "https://*.clerk.com",
          "https://clerk.*.com",
          "https://*.clerk.accounts.dev",
          "wss://*.clerk.accounts.dev",
          "wss://ws.clerk.com",
          // ── ImageKit (logos / QR images) ────────────────────────────────────
          "https://ik.imagekit.io",
          // ── Paddle (payments) ────────────────────────────────────────────────
          "https://cdn.paddle.com",
          "https://api.paddle.com",
          "https://buy.paddle.com",
          "https://checkout-service.paddle.com",
          "https://sandbox-cdn.paddle.com",
          "https://sandbox-buy.paddle.com",
          "https://sandbox-checkout-service.paddle.com",
          "https://*.paddle.com",
          // ── OpenStreetMap (geo / maps) ───────────────────────────────────────
          "https://nominatim.openstreetmap.org",
          // ── Microsoft Clarity (analytics) ───────────────────────────────────
          "https://*.clarity.ms",
          "https://c.bing.com",
        ],
        "img-src": [
          "'self'",
          "data:",
          "blob:",
          // ── Clerk (user profile pictures) ───────────────────────────────────
          "https://img.clerk.com",
          "https://*.clerk.com",
          // ── ImageKit ────────────────────────────────────────────────────────
          "https://ik.imagekit.io",
          // ── Giphy (used in MissionPassedModal) ──────────────────────────────
          "https://media0.giphy.com",
          "https://media1.giphy.com",
          "https://media2.giphy.com",
          "https://media3.giphy.com",
          "https://media4.giphy.com",
          "https://i.giphy.com",
          // ── OpenStreetMap tiles ──────────────────────────────────────────────
          "https://*.tile.openstreetmap.org",
          "https://unpkg.com",
          // ── Microsoft Clarity ────────────────────────────────────────────────
          "https://*.clarity.ms",
          "https://c.bing.com",
        ],
        "script-src": [
          "'self'",
          // ── Clerk JS bundle (loaded from the Frontend API) ───────────────────
          "https://*.clerk.com",
          "https://clerk.*.com",
          "https://*.clerk.accounts.dev",
          // ── Cloudflare Turnstile (bot protection used by Clerk) ──────────────
          "https://challenges.cloudflare.com",
          // ── Paddle ───────────────────────────────────────────────────────────
          "https://cdn.paddle.com",
          "https://sandbox-cdn.paddle.com",
          // ── Microsoft Clarity ────────────────────────────────────────────────
          "https://*.clarity.ms",
          "https://c.bing.com",
          // ── Allow inline scripts (required by Next.js / Clerk bootstrapping) ─
          "'unsafe-inline'",
        ],
        "style-src": [
          "'self'",
          // ── Clerk (injects inline component styles) ──────────────────────────
          "https://*.clerk.com",
          "https://clerk.*.com",
          // ── Google Fonts ─────────────────────────────────────────────────────
          "https://fonts.googleapis.com",
          // ── Paddle ───────────────────────────────────────────────────────────
          "https://cdn.paddle.com",
          "https://sandbox-cdn.paddle.com",
          // ── Allow inline styles (required by Clerk + Tailwind) ───────────────
          "'unsafe-inline'",
        ],
        "font-src": [
          "'self'",
          "https://fonts.gstatic.com",
          "data:",
        ],
        "frame-src": [
          // ── Clerk (account portal, OAuth pop-ups) ───────────────────────────
          "https://*.clerk.com",
          "https://clerk.*.com",
          "https://*.clerk.accounts.dev",
          // ── Cloudflare Turnstile (bot protection used by Clerk) ──────────────
          "https://challenges.cloudflare.com",
          // ── Paddle (checkout overlay) ────────────────────────────────────────
          "https://buy.paddle.com",
          "https://cdn.paddle.com",
          "https://checkout-service.paddle.com",
          "https://sandbox-buy.paddle.com",
          "https://sandbox-cdn.paddle.com",
          "https://sandbox-checkout-service.paddle.com",
        ],
        // ── Clerk uses blob: web workers for session management ─────────────────
        "worker-src": ["'self'", "blob:"],
      },
    },
  }
);

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
