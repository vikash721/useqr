import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "Contact UseQR",
  description:
    "Get in touch with the UseQR team. Questions, partnerships, or support—we're here to help.",
  openGraph: {
    title: "Contact UseQR – Get in touch",
    description:
      "Get in touch with the UseQR team. Questions, partnerships, or support—we're here to help.",
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
