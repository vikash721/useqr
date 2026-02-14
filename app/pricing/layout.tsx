import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "QR Code Generator Pricing – Free, Pro & Business Plans",
  description:
    "Compare UseQR pricing plans. Get started free or unlock advanced features like QR code analytics, bulk generation, and custom branding with Pro and Business.",
  keywords: [
    "QR code pricing",
    "QR code generator price",
    "free QR code generator",
    "QR code plans",
    "UseQR pricing",
    "dynamic QR code pricing",
  ],
  openGraph: {
    title: "QR Code Generator Pricing – Free, Pro & Business Plans | UseQR",
    description:
      "Compare UseQR pricing plans. Get started free or unlock advanced features like QR code analytics, bulk generation, and custom branding.",
    url: `${siteUrl}/pricing`,
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/pricing`,
  },
};

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
