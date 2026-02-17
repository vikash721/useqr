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
          "https://ik.imagekit.io",
          "https://cdn.paddle.com",
          "https://api.paddle.com",
          "https://buy.paddle.com",
          "https://checkout-service.paddle.com",
          "https://sandbox-cdn.paddle.com",
          "https://sandbox-buy.paddle.com",
          "https://sandbox-checkout-service.paddle.com",
          "https://*.paddle.com",
          "https://nominatim.openstreetmap.org",
          "https://*.clarity.ms",
          "https://c.bing.com",
        ],
        "img-src": [
          "data:",
          "blob:",
          "https://ik.imagekit.io",
          "https://media0.giphy.com",
          "https://media1.giphy.com",
          "https://media2.giphy.com",
          "https://media3.giphy.com",
          "https://media4.giphy.com",
          "https://i.giphy.com",
          "https://*.tile.openstreetmap.org",
          "https://unpkg.com",
          "https://*.clarity.ms",
          "https://c.bing.com",
        ],
        "script-src": [
          "https://cdn.paddle.com",
          "https://sandbox-cdn.paddle.com",
          "https://*.clarity.ms",
          "https://c.bing.com",
          "'unsafe-inline'",
        ],
        "style-src": [
          "https://fonts.googleapis.com",
          "https://cdn.paddle.com",
          "https://sandbox-cdn.paddle.com",
        ],
        "font-src": ["https://fonts.gstatic.com", "data:"],
        "frame-src": [
          "https://buy.paddle.com",
          "https://cdn.paddle.com",
          "https://checkout-service.paddle.com",
          "https://sandbox-buy.paddle.com",
          "https://sandbox-cdn.paddle.com",
          "https://sandbox-checkout-service.paddle.com",
        ],
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
