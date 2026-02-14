import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "Contact Us – Get in Touch with UseQR",
  description:
    "Have a question about our QR code generator? Need help with custom QR codes, pricing, or partnerships? Contact the UseQR team — we're here to help.",
  keywords: [
    "contact UseQR",
    "QR code support",
    "QR code help",
    "UseQR support",
  ],
  openGraph: {
    title: "Contact Us – Get in Touch with UseQR",
    description:
      "Have a question about our QR code generator? Need help with custom QR codes, pricing, or partnerships? Contact the UseQR team.",
    url: `${siteUrl}/contact`,
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/contact`,
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
