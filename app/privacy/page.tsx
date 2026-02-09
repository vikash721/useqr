"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { LandingFooter } from "@/components/LandingFooter";
import { LandingHeader } from "@/components/LandingHeader";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useShouldShowHeader } from "@/utils/sidebar";

const CONTACT_EMAIL = "useqr.codes@gmail.com";
const LAST_UPDATED = "February 9, 2026";

export default function PrivacyPolicyPage() {
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
                  Privacy <span className="text-emerald-400">Policy</span>
                </h1>
                <p className="mt-4 text-lg text-zinc-400">
                  Last updated: {LAST_UPDATED}
                </p>
              </div>
            </section>

            {/* Content */}
            <section className="w-full bg-black px-6 py-16 lg:py-24">
              <div className="mx-auto max-w-3xl space-y-12">
                {/* Introduction */}
                <div>
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Introduction
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    UseQR (&quot;we,&quot; &quot;our,&quot; or &quot;us&quot;)
                    respects your privacy and is committed to protecting your
                    personal data. This Privacy Policy explains how we collect,
                    use, and safeguard your information when you use our website
                    and services at{" "}
                    <Link
                      href="/"
                      className="text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                      useqr.codes
                    </Link>
                    .
                  </p>
                </div>

                {/* Information We Collect */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Information We Collect
                  </h2>
                  <ul className="mt-6 space-y-4 text-zinc-400">
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        <strong className="text-white">Account data.</strong>{" "}
                        When you sign up, we collect your name, email address,
                        and password (stored securely hashed).
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        <strong className="text-white">QR content.</strong> Any
                        content you upload or enter to create QR codes—links,
                        text, images, videos, or files.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        <strong className="text-white">Usage data.</strong>{" "}
                        Basic analytics such as pages visited, QR scan counts,
                        browser type, and device information.
                      </span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>
                        <strong className="text-white">Payment data.</strong>{" "}
                        Billing information is processed by our third-party
                        payment provider. We do not store your full card details.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* How We Use Your Information */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    How We Use Your Information
                  </h2>
                  <ul className="mt-6 space-y-4 text-zinc-400">
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>To provide, maintain, and improve our services.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>To process transactions and send related information.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>To send you technical notices, security alerts, and support messages.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>To respond to your comments, questions, and requests.</span>
                    </li>
                    <li className="flex gap-3">
                      <span className="mt-1.5 size-1.5 shrink-0 rounded-none bg-emerald-400" />
                      <span>To monitor and analyze trends, usage, and activity.</span>
                    </li>
                  </ul>
                </div>

                {/* Data Sharing */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Data Sharing
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    We do not sell your personal information. We may share data
                    with trusted third-party service providers who help us
                    operate our platform (e.g., hosting, payment processing,
                    analytics). These providers are contractually obligated to
                    protect your data and use it only for the services they
                    provide to us.
                  </p>
                </div>

                {/* Data Security */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Data Security
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    We implement industry-standard security measures including
                    encryption in transit (TLS/SSL), secure password hashing,
                    and regular security reviews. While no system is 100%
                    secure, we take reasonable precautions to protect your data.
                  </p>
                </div>

                {/* Cookies */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Cookies
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    We use essential cookies to keep you logged in and remember
                    your preferences. We may also use analytics cookies to
                    understand how our service is used. You can control cookie
                    settings through your browser preferences.
                  </p>
                </div>

                {/* Your Rights */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Your Rights
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    You have the right to access, update, or delete your
                    personal data at any time. You can manage most of your
                    information directly through your account settings. For
                    additional requests, contact us at{" "}
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="text-emerald-400 transition-colors hover:text-emerald-300"
                    >
                      {CONTACT_EMAIL}
                    </a>
                    .
                  </p>
                </div>

                {/* Changes to This Policy */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Changes to This Policy
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    We may update this Privacy Policy from time to time. We will
                    notify you of any material changes by posting the updated
                    policy on this page with a revised &quot;last updated&quot;
                    date. Continued use of our services after changes
                    constitutes acceptance of the updated policy.
                  </p>
                </div>

                {/* Contact */}
                <div className="border-t border-white/10 pt-12">
                  <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
                    Contact Us
                  </h2>
                  <p className="mt-4 leading-relaxed text-zinc-400">
                    If you have questions about this Privacy Policy, please
                    reach out at{" "}
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
            <p className="text-zinc-400">Privacy Policy</p>
          </div>
        )}
      </main>
    </>
  );
}
