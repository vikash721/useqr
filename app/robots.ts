import type { MetadataRoute } from "next";

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.useqr.codes";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/dashboard", "/api/", "/sso-callback", "/card/", "/q/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
