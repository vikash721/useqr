import type { Metadata } from "next";

const siteUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://useqr.codes";

export const metadata: Metadata = {
  title: "About UseQR",
  description:
    "UseQR is a modern QR code platform for custom, reusable QR codes. Store images, video, links, or your contact—one code, any content, yours forever.",
  openGraph: {
    title: "About UseQR – One QR. Any content. Yours forever.",
    description:
      "UseQR is a modern QR code platform for custom, reusable QR codes. Store images, video, links, or your contact—one code, any content, yours forever.",
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
