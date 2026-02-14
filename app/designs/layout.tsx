import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "Custom QR Code Designs – Colors, Logos & Print Styles",
  description:
    "Design stunning custom QR codes with your brand colors, logo, and unique shapes. Order professional QR code stickers, cards, and signage — printed and delivered.",
  keywords: [
    "custom QR code design",
    "QR code with logo",
    "QR code colors",
    "QR code stickers",
    "branded QR code",
    "QR code print",
  ],
  openGraph: {
    title: "Custom QR Code Designs – Colors, Logos & Print Styles | UseQR",
    description:
      "Design stunning custom QR codes with your brand colors, logo, and unique shapes. Order professional QR code stickers, cards, and signage.",
    url: `${siteUrl}/designs`,
    type: "website",
  },
  alternates: {
    canonical: `${siteUrl}/designs`,
  },
};

export default function DesignsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
