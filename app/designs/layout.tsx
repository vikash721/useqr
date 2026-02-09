import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "Design Your QR – Colors, Logo & Print Styles | UseQR",
  description:
    "Style your QR with colors, shapes, and optional logo. Order stickers, cards, labels, or signage—printed and delivered.",
  openGraph: {
    title: "Design Your QR | UseQR",
    description:
      "Style your QR with colors, shapes, and optional logo. Order stickers, cards, labels, or signage.",
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
