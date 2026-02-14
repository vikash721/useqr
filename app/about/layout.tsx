import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "About UseQR – The Modern QR Code Platform",
  description:
    "Learn about UseQR, the QR code generator for everyone. Create custom, dynamic, and trackable QR codes for personal use, marketing, events, business cards, and more.",
  keywords: [
    "about UseQR",
    "QR code platform",
    "QR code company",
    "dynamic QR code generator",
    "custom QR code maker",
    "personal QR code",
  ],
  openGraph: {
    title: "About UseQR – The Modern QR Code Platform",
    description:
      "Learn about UseQR, the QR code generator for everyone. Create custom, dynamic, and trackable QR codes for personal use, marketing, events, business cards, and more.",
    url: `${siteUrl}/about`,
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/about`,
  },
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
