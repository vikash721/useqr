import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalSidebarLayout } from "@/components/ConditionalSidebarLayout";
import { Toaster } from "@/components/Toaster";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.app";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "UseQR – One QR. Any content. Yours forever.",
    template: "%s | UseQR",
  },
  description:
    "Create custom QR codes for images, video, links, or your contact. Reusable, updatable—stick them anywhere. Get found. UseQR makes it simple.",
  keywords: [
    "QR code",
    "custom QR code",
    "QR code generator",
    "reusable QR code",
    "QR code for contact",
    "QR code for links",
    "QR code for video",
    "get found",
    "UseQR",
  ],
  authors: [{ name: "UseQR", url: siteUrl }],
  creator: "UseQR",
  publisher: "UseQR",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "UseQR",
    title: "UseQR – One QR. Any content. Yours forever.",
    description:
      "Create custom QR codes for images, video, links, or your contact. Reusable, updatable—stick them anywhere. Get found.",
    images: [
      {
        url: "/landing-page.png",
        width: 1200,
        height: 630,
        alt: "UseQR – One QR. Any content. Yours forever. Create custom QR codes for links, images, video, or your contact.",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "UseQR – One QR. Any content. Yours forever.",
    description:
      "Create custom QR codes for images, video, links, or your contact. Reusable, updatable—stick them anywhere. Get found.",
    images: ["/landing-page.png"],
    creator: "@useqr",
  },
  alternates: {
    canonical: siteUrl,
  },
  category: "technology",
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "UseQR",
  description:
    "Create custom QR codes for images, video, links, or your contact. Reusable, updatable—stick them anywhere. Get found.",
  url: siteUrl,
  applicationCategory: "UtilitiesApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <ConditionalSidebarLayout>{children}</ConditionalSidebarLayout>
        <Toaster />
      </body>
    </html>
  );
}
