"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShouldShowHeader } from "@/utils/sidebar";

const CONTACT_EMAIL = "useqr.codes@gmail.com";
const LAST_UPDATED = "February 9, 2026";

export default function TermsOfServicePage() {
  const showHeader = useShouldShowHeader();

  return (
    <>
      {showHeader ? (
        <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border px-4">
          <SidebarTrigger />
        </header>
      ) : (
        <LandingHeader />
      )}
      <main className="relative flex-1">
        {!showHeader ? (
          <div className="relative">
            {/* Hero */}
            <section className="w-full border-b border-white/10 bg-black px-6 py-20 lg:py-28">
              <div className="mx-auto max-w-3xl text-center">
                <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
                  Terms of <span className="text-emerald-400">Service</span>
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  Last updated: {LAST_UPDATED}
                </p>
              </div>
            </section>

            {/* Content */}
            <section className="w-full bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl space-y-12">
                {/* Agreement */}
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Agreement to Terms
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    By accessing or using UseQR (&quot;the Service&quot;), you
                    agree to be bound by these Terms of Service. If you do not
                    agree to these terms, please do not use the Service. These
                    terms apply to all visitors, users, and others who access or
                    use the Service.
                  </p>
                </div>

                {/* Account */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Your Account
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    You are responsible for maintaining the security of your
                    account and password. UseQR cannot and will not be liable for
                    any loss or damage from your failure to maintain the security
                    of your account. You are responsible for all activity that
                    occurs under your account.
                  </p>
                </div>

                {/* Acceptable Use */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Acceptable Use
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    You agree not to use the Service to:
                  </p>
                  <ul className="mt-6 space-y-4 text-zinc-400">
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        Upload or distribute content that is unlawful, harmful,
                        threatening, abusive, defamatory, or otherwise
                        objectionable.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        Impersonate any person or entity, or falsely represent
                        your affiliation with a person or entity.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        Distribute malware, viruses, or any other malicious code
                        through QR codes or uploaded content.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        Attempt to gain unauthorized access to other accounts,
                        computer systems, or networks.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        Use the Service for phishing, scamming, or redirecting
                        users to fraudulent websites.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* QR Codes and Content */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    QR Codes & Content
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    You retain ownership of the content you upload to UseQR. By
                    using the Service, you grant us a limited license to host,
                    store, and display your content as necessary to provide the
                    Service. You are solely responsible for the content behind
                    your QR codes.
                  </p>
                </div>

                {/* Payments and Subscriptions */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Payments & Subscriptions
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    Certain features of the Service require a paid subscription.
                    By subscribing, you agree to pay the applicable fees.
                    Subscriptions renew automatically unless cancelled before the
                    renewal date. Refunds are handled on a case-by-case basis at
                    our discretion.
                  </p>
                </div>

                {/* Print & Delivery */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Print & Delivery Orders
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    For physical QR code products (stickers, cards, labels,
                    signage), delivery times are estimates and may vary. We are
                    not responsible for delays caused by shipping carriers. If
                    your order arrives damaged or incorrect, contact us within 14
                    days for a replacement or refund.
                  </p>
                </div>

                {/* Intellectual Property */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Intellectual Property
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    The Service, including its original content (excluding
                    user-provided content), features, and functionality, is owned
                    by UseQR and protected by copyright, trademark, and other
                    applicable laws. You may not copy, modify, or distribute our
                    branding or proprietary materials without written permission.
                  </p>
                </div>

                {/* Limitation of Liability */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Limitation of Liability
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    UseQR is provided &quot;as is&quot; and &quot;as
                    available&quot; without warranties of any kind. To the
                    fullest extent permitted by law, UseQR shall not be liable
                    for any indirect, incidental, special, consequential, or
                    punitive damages resulting from your use of the Service.
                  </p>
                </div>

                {/* Termination */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Termination
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    We may suspend or terminate your access to the Service at any
                    time, without prior notice, for conduct that we believe
                    violates these Terms or is harmful to other users, us, or
                    third parties. Upon termination, your right to use the
                    Service will immediately cease.
                  </p>
                </div>

                {/* Changes */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Changes to These Terms
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    We reserve the right to modify these Terms at any time. We
                    will provide notice of significant changes by updating the
                    &quot;last updated&quot; date at the top of this page.
                    Continued use of the Service after changes constitutes
                    acceptance of the revised Terms.
                  </p>
                </div>

                {/* Contact */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Contact Us
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    If you have any questions about these Terms, please contact
                    us at{" "}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </p>
                </div>
              </div>
            </section>

            {/* Back */}
            <section className="w-full border-t border-white/10 bg-black px-6 py-12">
              <div className="mx-auto max-w-2xl text-center">
                <Link
                  href="/"
                  className="inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
                >
                  <ArrowLeft className="size-4" aria-hidden />
                  Back to home
                </Link>
              </div>
            </section>

            <LandingFooter />
          </div>
        ) : (
          <div className="p-4">
            <p className="text-zinc-400">Terms of Service</p>
          </div>
        )}
      </main>
    </>
  );
}
