import type { Metadata } from "next";
import { Suspense } from "react";
import { Geist, Geist_Mono } from "next/font/google";
import { ConditionalSidebarLayout } from "@/components/ConditionalSidebarLayout";
import { AMThanksModal } from "@/components/modals";
import { ClerkProvider } from "@/components/providers/ClerkProvider";
import { PaddleProvider } from "@/components/providers/PaddleProvider";
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

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://www.useqr.codes";

const defaultTitle =
  "QR Code Generator | Create Custom, Dynamic QR Codes | UseQR";
const defaultDescription =
  "Create custom, dynamic QR codes with logos, colors, and shapes. Track scans, update content anytime, and use them for anything — personal or professional.";
const ogImageUrl = `${siteUrl}/landing-page.png`;
const ogImageAlt =
  "UseQR – The Best QR Code Generator for Your Business. Create custom QR codes. Get started free.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | UseQR",
  },
  description: defaultDescription,
  keywords: [
    "qr code",
    "qr code generator",
    "free qr code generator",
    "dynamic qr code",
    "custom qr code",
    "qr code with logo",
    "qr code analytics",
    "trackable qr codes",
    "qr code for business",
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
  "@type": "SoftwareApplication",
  name: "UseQR",
  description:
    "Create custom, dynamic QR codes with logos, colors, and shapes. Track scans, update content anytime, and use them for anything — personal or professional.",
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan with core QR code features",
  },
  aggregateRating: {
    "@type": "AggregateRating",
    ratingValue: "4.8",
    ratingCount: "150",
    bestRating: "5",
    worstRating: "1",
  },
  brand: {
    "@type": "Brand",
    name: "UseQR",
  },
  publisher: {
    "@type": "Organization",
    name: "UseQR",
    url: siteUrl,
  },
  featureList:
    "Custom QR Codes, Dynamic QR Codes, QR Code Analytics, QR Code with Logo, Bulk QR Code Generator, vCard QR Codes",
  screenshot: `${siteUrl}/landing-page.png`,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UseQR",
  url: siteUrl,
  logo: `${siteUrl}/logo/svg/logo.svg`,
  description:
    "UseQR is a QR code generator platform that helps businesses create custom, trackable, and dynamic QR codes.",
  sameAs: [],
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
        <ClerkProvider>
          <PaddleProvider>
            <UserSyncOnMount />
            <VisitTelegramNotify />
          <Suspense fallback={null}>
            <AMThanksModal />
          </Suspense>
          <ConditionalSidebarLayout>{children}</ConditionalSidebarLayout>
            <Toaster />
          </PaddleProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}
