
import { Suspense } from "react";
import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Dynamic QR Code Generator | Update Links Anytime | UseQR",
  description:
    "Best dynamic QR code generator to create editable tracking QR codes. Update destination URL anytime without reprinting. Free plan with analytics.",
  alternates: {
    canonical: "https://www.useqr.codes/dynamic-qr-code-generator",
  },
  openGraph: {
    title: "Dynamic QR Code Generator | Update Links Anytime | UseQR",
    description:
      "Best dynamic QR code generator to create editable tracking QR codes. Update destination URL anytime without reprinting. Free plan with analytics.",
    url: "https://www.useqr.codes/dynamic-qr-code-generator",
  },
};

const faqItems = [
  {
    question: "What is a dynamic QR code generator?",
    answer:
      "A dynamic QR code generator allows you to create QR codes where the destination URL can be changed after the code is printed. This means you don't need to reprint your marketing materials if your link changes.",
  },
  {
    question: "Why should I use a dynamic QR code instead of a static one?",
    answer:
      "Dynamic QR codes offer two main advantages: editability and tracking. You can update the content anytime, and you get detailed analytics on how many people scanned your code, where, and when.",
  },
  {
    question: "Can I switch the destination URL of my QR code?",
    answer:
      "Yes! With UseQR, you can log in to your dashboard and change the destination URL instantly. The physical QR code remains the same, but it will redirect to the new link.",
  },
  {
    question: "Is UseQR's dynamic QR code generator free?",
    answer:
      "Yes, we offer a free plan that lets you create dynamic QR codes with essential features. For advanced analytics and unlimited scans, we offer affordable premium plans.",
  },
  {
    question: "Do dynamic QR codes expire?",
    answer:
      "As long as your account is active, your dynamic QR codes will work. We do not expire codes on active accounts.",
  },
];

export default function DynamicQrPage() {
  return (
    <Suspense fallback={null}>
      <HomeClient
        heroTitle={
          <>
            Dynamic QR Code Generator. Edit Content{" "}
            <span className="text-emerald-400">Anytime</span>.
          </>
        }
        heroSubtitle="The most advanced dynamic QR code generator. Change your destination URL, track scans, and manage campaigns without reprinting."
        faqItems={faqItems}
      />
    </Suspense>
  );
}
