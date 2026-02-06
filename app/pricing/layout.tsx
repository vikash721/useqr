import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "Pricing",
  description:
    "UseQR pricing plans: Free, Pro, and Business. Create custom QR codes for links, images, video, or your contact. Compare features and choose the right plan.",
  openGraph: {
    title: "Pricing | UseQR – One QR. Any content. Yours forever.",
    description:
      "Compare UseQR plans. Free, Pro, and Business tiers for custom QR codes. Choose the right plan for your needs.",
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
