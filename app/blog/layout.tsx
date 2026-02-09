import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "Blog – QR Code Tips, Guides & Best Practices | UseQR",
  description:
    "Expert guides on QR codes: dynamic vs static, business card QR codes, contact QR codes, and best practices for print and digital. Learn how to use QR codes effectively.",
  keywords: [
    "QR code blog",
    "QR code guide",
    "dynamic QR code",
    "QR code best practices",
    "business card QR code",
    "contact QR code",
    "UseQR",
  ],
  openGraph: {
    title: "Blog – QR Code Tips & Best Practices | UseQR",
    description:
      "Guides and tips on QR codes: dynamic vs static, contact QR codes, and best practices for print and digital.",
    url: `${siteUrl}/blog`,
    type: "website",
    siteName: "UseQR",
  },
  alternates: {
    canonical: `${siteUrl}/blog`,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
