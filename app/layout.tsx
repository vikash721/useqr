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
import { QueryProvider } from "@/components/providers/QueryProvider";
import { ClarityScript } from "@/components/analytics/ClarityScript";
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
  "Dynamic & Custom QR Code Generator with Free Plan & Analytics | UseQR";
const defaultDescription =
  "Create free dynamic QR codes with custom logos, colors & multiple types. Track scan analytics and update content anytime with UseQR’s flexible QR tools.";
const ogImageUrl = `${siteUrl}/landing-page.png`;
const ogImageAlt =
  "UseQR – The Best QR Code Generator for Your Business. Create custom QR codes. Get started free.";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: defaultTitle,
    template: "%s | UseQR – Use QR Codes Smarter",
  },
  description: defaultDescription,
  keywords: [
    "dynamic qr code generator",
    "free dynamic qr code generator",
    "custom qr code generator with logo",
    "qr code generator with analytics",
    "trackable qr codes",
    "editable qr codes",
    "reusable qr codes",
    "qr code generator for business",
    "multiple qr code types",
    "UseQR dynamic qr platform",
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
  alternateName: ["Use QR"],
  description:
    "Create free dynamic QR codes with custom logos, colors & multiple QR types. Track detailed scan analytics and update your QR anytime — perfect for business or personal use.",
  url: siteUrl,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Marketing Software",
  operatingSystem: "Web",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "USD",
    description: "Free plan with core QR code features",
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
    "Dynamic QR Codes, Reusable QR Codes, Custom QR Codes with Logo, Detailed QR Code Analytics, Multiple QR Code Types (URL, vCard, WiFi, PDF), Bulk QR Code Generator",
  screenshot: `${siteUrl}/landing-page.png`,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: "UseQR",
  alternateName: ["Use QR"],
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
    <QueryProvider>
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
            dangerouslySetInnerHTML={{
              __html: JSON.stringify(organizationJsonLd),
            }}
          />
          <ClarityScript />
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
    </QueryProvider>
  );
}
