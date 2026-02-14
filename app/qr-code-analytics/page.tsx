
import { Suspense } from "react";
import { Metadata } from "next";
import HomeClient from "@/components/HomeClient";

export const metadata: Metadata = {
  title: "QR Code Analytics & Tracking | Measure Scan Performance | UseQR",
  description:
    "Track QR code scans with detailed analytics. Monitor location, device, time, and unique scans. Optimize your marketing campaigns with real-time data.",
  alternates: {
    canonical: "https://www.useqr.codes/qr-code-analytics",
  },
  openGraph: {
    title: "QR Code Analytics & Tracking | Measure Scan Performance | UseQR",
    description:
      "Track QR code scans with detailed analytics. Monitor location, device, time, and unique scans. Optimize your marketing campaigns with real-time data.",
    url: "https://www.useqr.codes/qr-code-analytics",
  },
};

const faqItems = [
  {
    question: "What kind of analytics does UseQR provide?",
    answer:
      "UseQR provides detailed analytics for dynamic QR codes, including total scans, unique visitors, scan location (city/country), device type, and time of day.",
  },
  {
    question: "How accurate is QR code tracking?",
    answer:
      "Our QR code tracking is very accurate. We capture data directly from the scan request, giving you reliable insights into who is scanning your code and from where.",
  },
  {
      question: "Can I track scans in real-time?",
      answer:
        "Yes, all scans are tracked in real-time. You can see your analytics dashboard update instantly as people scan your QR codes.",
  },
  {
    question: "What metrics are most important for QR code campaigns?",
    answer:
      "Usually, total scans and scan locations are key metrics. If you see high scans from a specific city, you might want to increase marketing efforts there.",
  },
  {
    question: "Can I export my QR code analytics data?",
    answer:
      "Currently, you can view all data in our dashboard. We are working on adding export features (CSV/PDF) for premium users soon.",
  },
];

export default function AnalyticsQrPage() {
  return (
    <Suspense fallback={null}>
      <HomeClient
        heroTitle={
          <>
            Powerful QR Code Analytics.{" "}
            <span className="text-emerald-400">Track Every Scan</span> in Real-Time.
          </>
        }
        heroSubtitle="Gain actionable insights from your QR codes. Track scan locations, devices, and times to optimize your marketing performance."
        faqItems={faqItems}
      />
    </Suspense>
  );
}
