
import { Suspense } from "react";
import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Custom QR Code Generator with Logo | Branded QR Codes | UseQR",
  description:
    "Create custom QR codes with your brand logo, colors, and unique shapes. Professional QR code design tool for measuring brand engagement.",
  alternates: {
    canonical: "https://www.useqr.codes/qr-code-with-logo",
  },
  openGraph: {
    title: "Custom QR Code Generator with Logo | Branded QR Codes | UseQR",
    description:
      "Create custom QR codes with your brand logo, colors, and unique shapes. Professional QR code design tool for measuring brand engagement.",
    url: "https://www.useqr.codes/qr-code-with-logo",
  },
};

const faqItems = [
  {
    question: "Can I add my logo to the QR code?",
    answer:
      "Yes! With UseQR, you can easily upload your logo and place it in the center of your QR code. We also support transparent backgrounds.",
  },
  {
    question: "Can I customize the colors of my QR code?",
    answer:
      "Absolutely. You can choose any color for your QR code dots, corners, and background. Match your brand colors effortlessly.",
  },
  {
    question: "Do custom QR codes still scan correctly?",
    answer:
      "Yes, as long as there is enough contrast between the code and the background. Our generator ensures your custom design remains scannable.",
  },
  {
    question: "What design features are available?",
    answer:
      "You can add logos, change colors, adjust dot style (dots, squares, rounded), corner shapes, and more.",
  },
  {
    question: "Is branding available on the free plan?",
    answer:
      "Basic customization is available on the free plan. Advanced options like custom logos and vector file downloads are available on premium plans.",
  },
];

export default function LogoQrPage() {
  return (
    <Suspense fallback={null}>
      <HomeClient
        heroTitle={
          <>
            Custom QR Code Generator with <span className="text-emerald-400">Your Logo</span>.
          </>
        }
        heroSubtitle="Elevate your brand with custom QR codes. Add your logo, choose your colors, and create unique designs that stand out."
        faqItems={faqItems}
      />
    </Suspense>
  );
}
