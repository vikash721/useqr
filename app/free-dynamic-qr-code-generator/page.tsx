
import { Suspense } from "react";
import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "Free Dynamic QR Code Generator | No Credit Card Required | UseQR",
  description:
    "Create free dynamic QR codes that never expire. Edit URLs anytime. Get started with our generous free plan for personal and business use.",
  alternates: {
    canonical: "https://www.useqr.codes/free-dynamic-qr-code-generator",
  },
  openGraph: {
    title: "Free Dynamic QR Code Generator | No Credit Card Required | UseQR",
    description:
      "Create free dynamic QR codes that never expire. Edit URLs anytime. Get started with our generous free plan for personal and business use.",
    url: "https://www.useqr.codes/free-dynamic-qr-code-generator",
  },
};

const faqItems = [
  {
    question: "Is UseQR really free?",
    answer:
      "Yes! Our free plan allows you to create fully functional dynamic QR codes without a credit card. These are great for personal use or small businesses starting out.",
  },
  {
    question: "What features are included in the free plan?",
    answer:
      "You get unlimited scans, ability to edit destination URLs, basic analytics, and essential customization options.",
  },
  {
      question: "Will my free QR codes stop working?",
      answer:
        "No, your free dynamic QR codes will not expire as long as your account remains active.",
  },
  {
    question: "How many free dynamic QR codes can I create?",
    answer:
      "The free plan allows you to create and manage multiple dynamic QR codes. Check our pricing page for current limits.",
  },
  {
    question: "Do I need a credit card to sign up for free?",
    answer:
      "No credit card is needed to start with the free plan. Just sign up with your email or social login.",
  },
];

export default function FreeDynamicQrPage() {
  return (
    <Suspense fallback={null}>
      <HomeClient
        heroTitle={
          <>
            Free Dynamic QR Code Generator.{" "}
            <span className="text-emerald-400">Forever Free Plan</span>.
          </>
        }
        heroSubtitle="Get started with powerful dynamic QR codes for free. Update links, track scans, and manage your codes without paying a cent."
        faqItems={faqItems}
      />
    </Suspense>
  );
}
