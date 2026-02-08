import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalSidebarLayout } from "@/components/ConditionalSidebarLayout";
import { AMThanksModal } from "@/components/modals";
import { ClerkProvider } from "@/components/providers/ClerkProvider";
import { Toaster } from "@/components/Toaster";
import { UserSyncOnMount } from "@/components/UserSyncOnMount";
import { VisitTelegramNotify } from "@/components/VisitTelegramNotify";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

const defaultTitle =
  "Get reusable QR codes. Store anything—links, video, contact. Yours forever.";
const defaultDescription =
  "Create custom QR codes for images, video, links, or your contact. Reusable, updatable—stick them anywhere. Get found. UseQR makes it simple.";
const ogImageUrl = `${siteUrl}/landing-page.png`;
const ogImageAlt =
  "UseQR – One QR. Any content. Yours forever. Create custom QR codes. Get started free.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | UseQR",
  },
  description: defaultDescription,
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
    title: defaultTitle,
    description: defaultDescription,
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: ogImageAlt,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: defaultTitle,
    description: defaultDescription,
    images: [ogImageUrl],
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
        <ClerkProvider>
          <UserSyncOnMount />
          <VisitTelegramNotify />
          <Suspense fallback={null}>
            <AMThanksModal />
          </Suspense>
          <ConditionalSidebarLayout>{children}</ConditionalSidebarLayout>
          <Toaster />
        </ClerkProvider>
      </body>
    </html>
  );
}
