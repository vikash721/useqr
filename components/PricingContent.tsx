"use client";

import { useUser } from "@clerk/nextjs";
import { Check, Minus } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { PlanThankYouModal } from "@/components/modals";
import { PADDLE_CHECKOUT_COMPLETED_EVENT, usePaddle } from "@/components/providers/PaddleProvider";
import { usersApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useUserStore } from "@/stores/useUserStore";

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Try it free",
    price: "$0",
    period: "forever",
    cta: "Get started",
    href: "/dashboard",
    featured: false,
  },
  {
    id: "starter",
    name: "Starter",
    description: "A little more for personal use",
    price: "$4.99",
    period: "/month",
    cta: "Get Starter",
    href: "#",
    featured: false,
  },
  {
    id: "pro",
    name: "Pro",
    description: "For creators and small teams",
    price: "$11.99",
    period: "/month",
    cta: "Get Pro",
    href: "#",
    featured: true,
  },
  {
    id: "business",
    name: "Business",
    description: "For teams and organizations",
    price: "$29.99",
    period: "/month",
    cta: "Get Business",
    href: "#",
    featured: false,
  },
] as const;

type FeatureValue = true | false | string;

const FEATURES: {
  name: string;
  free: FeatureValue;
  starter: FeatureValue;
  pro: FeatureValue;
  business: FeatureValue;
}[] = [
  { name: "QR codes included", free: "2", starter: "5", pro: "15", business: "Unlimited" },
  { name: "Links & text", free: true, starter: true, pro: true, business: true },
  { name: "Images & video", free: false, starter: true, pro: true, business: true },
  { name: "Contact (vCard)", free: false, starter: false, pro: true, business: true },
  { name: "Custom colors & logo", free: false, starter: false, pro: true, business: true },
  { name: "Remove UseQR branding", free: false, starter: false, pro: true, business: true },
  { name: "Update content anytime", free: true, starter: true, pro: true, business: true },
  { name: "Scan analytics", free: false, starter: false, pro: true, business: true },
  { name: "High-res download", free: true, starter: true, pro: true, business: true },
  { name: "Priority support", free: false, starter: false, pro: true, business: true },
  { name: "Team members", free: false, starter: false, pro: "3", business: "Unlimited" },
  { name: "SSO (SAML)", free: false, starter: false, pro: false, business: true },
  { name: "Dedicated support", free: false, starter: false, pro: false, business: true },
];

function CellContent({ value }: { value: FeatureValue }) {
  if (value === true) {
    return (
      <span className="inline-flex size-6 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-400">
        <Check className="size-3.5 stroke-[2.5]" />
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="inline-flex size-6 items-center justify-center text-zinc-600">
        <Minus className="size-3.5 stroke-2" />
      </span>
    );
  }
  return <span className="text-sm font-medium text-zinc-300">{value}</span>;
}

/**
 * Shared pricing content used by both `/pricing` (landing) and `/dashboard/pricing` (sidebar).
 * Pass `showCta={false}` to hide the bottom CTA section inside the dashboard.
 */
export function PricingContent({ showCta = true }: { showCta?: boolean }) {
  const [planModalOpen, setPlanModalOpen] = useState(false);
  const [planModalVariant, setPlanModalVariant] = useState<"success" | "coming_soon">("coming_soon");
  const [planModalPlanName, setPlanModalPlanName] = useState<string | undefined>();
  const lastOpenedPlanRef = useRef<"starter" | "pro" | "business" | null>(null);
  const { openCheckout } = usePaddle();
  const { user } = useUser();
  const setUser = useUserStore((s) => s.setUser);

  useEffect(() => {
    const onCheckoutCompleted = async () => {
      const planId = lastOpenedPlanRef.current;
      const planName = planId ? PLANS.find((p) => p.id === planId)?.name : undefined;
      setPlanModalPlanName(planName);
      setPlanModalVariant("success");
      setPlanModalOpen(true);
      const updateStoreFromSync = (data: Awaited<ReturnType<typeof usersApi.sync>>) => {
        if (data?.ok && data.user) {
          setUser({
            clerkId: data.user.clerkId,
            email: data.user.email ?? null,
            name: data.user.name ?? null,
            imageUrl: data.user.imageUrl ?? null,
            plan: data.user.plan,
            createdAt: data.user.createdAt,
          });
        }
      };
      try {
        updateStoreFromSync(await usersApi.sync());
        // Webhook may still be in flight; refetch after a short delay so the store shows the updated plan.
        setTimeout(async () => {
          try {
            updateStoreFromSync(await usersApi.sync());
          } catch {
            // ignore
          }
        }, 2500);
      } catch {
        toast.error("Could not refresh your plan. Please refresh the page.");
      } finally {
        lastOpenedPlanRef.current = null;
      }
    };
    window.addEventListener(PADDLE_CHECKOUT_COMPLETED_EVENT, onCheckoutCompleted);
    return () => window.removeEventListener(PADDLE_CHECKOUT_COMPLETED_EVENT, onCheckoutCompleted);
  }, [setUser]);

  const handlePaidPlanClick = async (planId: "starter" | "pro" | "business") => {
    lastOpenedPlanRef.current = planId;
    const opened = await openCheckout(planId, {
      clerkId: user?.id,
      email: user?.primaryEmailAddress?.emailAddress ?? undefined,
    });
    if (!opened) {
      lastOpenedPlanRef.current = null;
      setPlanModalVariant("coming_soon");
      setPlanModalPlanName(undefined);
      setPlanModalOpen(true);
    }
  };

  return (
    <>
      {/* Hero */}
      <section className="w-full border-b border-white/10 bg-black px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Simple, transparent <span className="text-emerald-400">pricing</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Choose the plan that fits. Upgrade or downgrade anytime.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="w-full border-b border-white/10 bg-black px-6 py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-lg border px-6 py-6 transition-colors ${
                plan.featured
                  ? "border-emerald-500/50 bg-emerald-500/5"
                  : "border-white/10 bg-white/2 hover:border-white/15"
              }`}
            >
              {plan.featured && (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              )}
              <h3 className="text-lg font-semibold text-white">{plan.name}</h3>
              <p className="mt-1 text-sm text-zinc-500">{plan.description}</p>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="text-2xl font-bold tracking-tight text-white">
                  {plan.price}
                </span>
                <span className="text-sm text-zinc-500">{plan.period}</span>
              </div>
              {plan.id === "free" ? (
                <Link
                  href={plan.href}
                  className={`mt-6 cursor-pointer flex h-10 w-full items-center justify-center rounded-none text-sm font-medium transition-colors ${
                    plan.featured
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={() =>
                    handlePaidPlanClick(plan.id as "starter" | "pro" | "business")
                  }
                  className={`mt-6 cursor-pointer flex h-10 w-full items-center justify-center rounded-none text-sm font-medium transition-colors ${
                    plan.featured
                      ? "bg-emerald-500 text-white hover:bg-emerald-600"
                      : "border border-white/20 bg-white/5 text-white hover:bg-white/10"
                  }`}
                >
                  {plan.cta}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section className="w-full border-b border-white/10 bg-black px-6 py-12 lg:py-16">
        <div className="mx-auto max-w-5xl">
          <div className="text-center">
            <h2 className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Compare plans
            </h2>
            <p className="mt-2 text-sm text-zinc-500">
              Everything you need to choose the right plan.
            </p>
          </div>

          <div className="mt-8 overflow-x-auto overflow-hidden rounded-lg border border-white/10">
            <table className="w-full min-w-[640px] border-collapse text-left">
              <thead>
                <tr className="border-b border-white/10 bg-white/2">
                  <th className="px-4 py-4 text-sm font-medium text-zinc-400">Feature</th>
                  <th className="px-4 py-4 text-sm font-medium text-zinc-400">Free</th>
                  <th className="px-4 py-4 text-sm font-medium text-zinc-400">Starter</th>
                  <th className="px-4 py-4 text-sm font-medium text-white">Pro</th>
                  <th className="px-4 py-4 text-sm font-medium text-zinc-400">Business</th>
                </tr>
              </thead>
              <tbody>
                {FEATURES.map((row, i) => (
                  <tr
                    key={row.name}
                    className={`border-b border-white/5 ${
                      i % 2 === 0 ? "bg-transparent" : "bg-white/2"
                    }`}
                  >
                    <td className="px-4 py-3.5 text-sm text-zinc-300">{row.name}</td>
                    <td className="px-4 py-3.5"><CellContent value={row.free} /></td>
                    <td className="px-4 py-3.5"><CellContent value={row.starter} /></td>
                    <td className="px-4 py-3.5 bg-emerald-500/5"><CellContent value={row.pro} /></td>
                    <td className="px-4 py-3.5"><CellContent value={row.business} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* CTA */}
      {showCta && (
        <section className="w-full border-b border-white/10 bg-black px-6 py-16 lg:py-20">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
              Start with the free plan
            </h2>
            <p className="mt-4 text-zinc-400">
              No credit card required. Create your first QR in seconds.
            </p>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/"
                className="inline-flex h-11 items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
              >
                Get started free
              </Link>
              <Link
                href="/login"
                className="inline-flex h-11 items-center justify-center rounded-none border border-white/20 bg-white/5 px-8 text-sm font-medium text-white transition-colors hover:bg-white/10"
              >
                Log in
              </Link>
            </div>
          </div>
        </section>
      )}

      <PlanThankYouModal
        open={planModalOpen}
        onOpenChange={setPlanModalOpen}
        variant={planModalVariant}
        planName={planModalPlanName}
      />
    </>
  );
}
