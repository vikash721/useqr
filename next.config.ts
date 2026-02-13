import type { NextConfig } from "next";

// Single CSP under our control so img-src includes ImageKit (Clerk's merge was not applying it).
const buildCsp = () => {
  const directives = [
    "default-src 'self'",
    "connect-src 'self' https://clerk-telemetry.com https://*.clerk-telemetry.com https://api.stripe.com https://maps.googleapis.com https://img.clerk.com https://*.clerk.accounts.dev https://*.clerk.com https://ik.imagekit.io https://cdn.paddle.com https://api.paddle.com https://buy.paddle.com https://checkout-service.paddle.com https://sandbox-cdn.paddle.com https://sandbox-buy.paddle.com https://sandbox-checkout-service.paddle.com https://*.paddle.com",
    "img-src 'self' https://img.clerk.com data: blob: https://ik.imagekit.io https://media0.giphy.com https://media1.giphy.com https://media2.giphy.com https://media3.giphy.com https://media4.giphy.com https://i.giphy.com",
    "script-src 'self' 'unsafe-inline' https: http: https://*.js.stripe.com https://js.stripe.com https://maps.googleapis.com https://challenges.cloudflare.com https://cdn.paddle.com https://sandbox-cdn.paddle.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.paddle.com https://sandbox-cdn.paddle.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "frame-src 'self' https://challenges.cloudflare.com https://*.js.stripe.com https://js.stripe.com https://hooks.stripe.com https://buy.paddle.com https://cdn.paddle.com https://checkout-service.paddle.com https://sandbox-buy.paddle.com https://sandbox-cdn.paddle.com https://sandbox-checkout-service.paddle.com",
    "form-action 'self'",
    "worker-src 'self' blob:",
  ];
  if (process.env.NODE_ENV !== "production") {
    // Next.js dev needs 'unsafe-eval' for Fast Refresh
    const i = directives.findIndex((d) => d.startsWith("script-src"));
    if (i !== -1) directives[i] += " 'unsafe-eval'";
  }
  return directives.join("; ");
};

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: buildCsp(),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
