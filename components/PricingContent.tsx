"use client";

import { useUser } from "@clerk/nextjs";
import { Check, Loader2, Minus, Info } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { PlanThankYouModal, ChangePlanModal } from "@/components/modals";
import { PADDLE_CHECKOUT_COMPLETED_EVENT, usePaddle } from "@/components/providers/PaddleProvider";
import { usersApi } from "@/lib/api";
import { toast } from "@/lib/toast";
import { useUserStore } from "@/stores/useUserStore";

function InfoTooltip({ text }: { text: string }) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);

  const handleMouseEnter = () => {
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.top - 10,
        left: rect.left + rect.width / 2,
      });
    }
    setShowTooltip(true);
  };

  return (
    <div className="relative inline-flex">
      <button
        ref={buttonRef}
        type="button"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
        className="inline-flex items-center justify-center text-zinc-500 hover:text-emerald-400 transition-colors"
      >
        <Info className="size-4" strokeWidth={2} />
      </button>
      {showTooltip && (
        <div
          className="fixed px-3 py-2 bg-zinc-900 border border-zinc-700 rounded text-xs text-zinc-200 whitespace-normal z-[9999] shadow-lg pointer-events-none max-w-xs break-words text-left"
          style={{
            top: `${position.top}px`,
            left: `${position.left}px`,
            transform: "translate(-50%, -100%)",
          }}
        >
          {text}
        </div>
      )}
    </div>
  );
}

const PLANS = [
  {
    id: "free",
    name: "Free",
    description: "Try it free",
    price: "$0",
    period: "forever",
    cta: "Go to dashboard",
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
  tooltip?: string;
  free: FeatureValue;
  starter: FeatureValue;
  pro: FeatureValue;
  business: FeatureValue;
}[] = [
  { name: "QR codes included", free: "5", starter: "25", pro: "100", business: "500" },
  { name: "Links & text", free: true, starter: true, pro: true, business: true },
  { name: "Images & video", free: false, starter: true, pro: true, business: true },
  { name: "Get Found QR", tooltip: "Mark items as lost or found and let finders contact you by scanning the QR code", free: false, starter: true, pro: true, business: true },
  { name: "Contact (vCard)", tooltip: "Digital contact cards that store name, phone, email, and more", free: false, starter: true, pro: true, business: true },
  { name: "Custom colors & logo", free: true, starter: true, pro: true, business: true },
  { name: "Remove UseQR branding", tooltip: "Hide UseQR watermark and use your own branding", free: false, starter: true, pro: true, business: true },
  { name: "Update content anytime", free: true, starter: true, pro: true, business: true },
  { name: "Smart redirect (device)", tooltip: "Automatically redirect scanners to device-appropriate content (deep link to app, App Store / Play Store, or mobile web)", free: false, starter: true, pro: true, business: true },
  { name: "Expiring QR", tooltip: "Set an expiration date/time for QR codes; expired codes automatically deactivate", free: false, starter: false, pro: true, business: true },
  { name: "Scan analytics", tooltip: "Track and analyze QR code scans. Higher plans retain data longer", free: false, starter: "30 days", pro: "60 days", business: "180 days" },
  { name: "CSV export", tooltip: "Export scan analytics as CSV for deeper analysis", free: false, starter: false, pro: true, business: true },
  { name: "Geo-fenced QR", tooltip: "Restrict scans to a geographic area (radius or polygon). Useful for location-based campaigns and reducing fraudulent scans.", free: false, starter: false, pro: true, business: true },
  { name: "High-res download", free: true, starter: true, pro: true, business: true },
  { name: "Priority support", free: false, starter: false, pro: true, business: true },
  { name: "Team members", tooltip: "Number of people who can access your account", free: "1", starter: "1", pro: "4", business: "10" },
  { name: "SSO (SAML)", tooltip: "Single Sign-On for enterprise security and user management", free: false, starter: false, pro: false, business: true },
  { name: "Dedicated support", tooltip: "Direct support channel with priority response times", free: false, starter: false, pro: false, business: true },
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
  const [changingPlanId, setChangingPlanId] = useState<"starter" | "pro" | "business" | null>(null);
  const [changePlanModalOpen, setChangePlanModalOpen] = useState(false);
  const [changePlanTarget, setChangePlanTarget] = useState<"starter" | "pro" | "business" | null>(null);
  const [previewAmount, setPreviewAmount] = useState<{ amountCents: number; currencyCode: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const lastOpenedPlanRef = useRef<"starter" | "pro" | "business" | null>(null);
  const { openCheckout } = usePaddle();
  const { user, isSignedIn } = useUser();
  const setUser = useUserStore((s) => s.setUser);
  const storeUser = useUserStore((s) => s.user);
  const router = useRouter();

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

  useEffect(() => {
    if (!changePlanModalOpen || !changePlanTarget) {
      setPreviewAmount(null);
      setPreviewError(null);
      return;
    }
    let cancelled = false;
    setPreviewLoading(true);
    setPreviewError(null);
    usersApi
      .getChangePlanPreview(changePlanTarget)
      .then((data) => {
        if (!cancelled) {
          setPreviewAmount({ amountCents: data.amountCents, currencyCode: data.currencyCode });
        }
      })
      .catch(() => {
        if (!cancelled) {
          setPreviewError("Could not load amount");
          setPreviewAmount(null);
        }
      })
      .finally(() => {
        if (!cancelled) setPreviewLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [changePlanModalOpen, changePlanTarget]);

  const handlePaidPlanClick = async (planId: "starter" | "pro" | "business") => {
    // Redirect to login if user is not signed in
    if (!isSignedIn) {
      router.push(`/login?redirect_url=${encodeURIComponent(`/pricing?plan=${planId}`)}`);
      return;
    }
    
    // Check if running on production domain (useqr.codes)
    const isProduction = typeof window !== "undefined" && window.location.hostname === "useqr.codes";
    
    if (isProduction) {
      // Show coming soon modal on production since Paddle is not verified yet
      setPlanModalVariant("coming_soon");
      setPlanModalPlanName(undefined);
      setPlanModalOpen(true);
      return;
    }
    
    // For other domains (localhost, dev, etc.), proceed with normal checkout
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

  const handleChangePlan = async (planId: "starter" | "pro" | "business") => {
    setChangingPlanId(planId);
    try {
      const data = await usersApi.changePlan(planId);
      toast.success(data.message);
      setChangePlanModalOpen(false);
      setChangePlanTarget(null);
      setPreviewAmount(null);
      setPreviewError(null);
      if (data.plan && storeUser) {
        setUser({
          ...storeUser,
          plan: data.plan as "free" | "starter" | "pro" | "business",
        });
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err instanceof Error ? err.message : "Failed to change plan");
      toast.error(message);
    } finally {
      setChangingPlanId(null);
    }
  };

  const currentPlanId = storeUser?.plan?.toLowerCase() ?? null;
  const hasActivePaidPlan =
    currentPlanId === "starter" || currentPlanId === "pro" || currentPlanId === "business";

  return (
    <>
      {/* Hero */}
      <section className="w-full border-b border-white/10 bg-black px-6 py-16 lg:py-20">
        <div className="mx-auto max-w-3xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-5xl">
            Simple, transparent <span className="text-emerald-400">pricing</span>
          </h1>
          <p className="mt-4 text-lg text-zinc-400">
            Choose the plan that fits. Start free, upgrade anytime.
          </p>
        </div>
      </section>

      {/* Plan cards */}
      <section className="w-full border-b border-white/10 bg-black px-6 py-12 lg:py-16">
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {PLANS.map((plan) => {
            const isCurrentPlan = currentPlanId !== null && plan.id === currentPlanId;
            return (
            <div
              key={plan.id}
              className={`relative flex flex-col rounded-lg border px-6 py-6 transition-colors ${
                isCurrentPlan
                  ? "border-amber-500/50 bg-amber-500/5 ring-1 ring-amber-500/30"
                  : plan.featured
                    ? "border-emerald-500/50 bg-emerald-500/5"
                    : "border-white/10 bg-white/2 hover:border-white/15"
              }`}
            >
              {isCurrentPlan ? (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-400 px-3 py-1 text-xs font-semibold text-black shadow-[0_0_12px_rgba(251,191,36,0.4)]">
                  <span className="size-1.5 shrink-0 rounded-full bg-black/40" />
                  Your plan
                </span>
              ) : plan.featured ? (
                <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 rounded bg-emerald-500 px-2 py-0.5 text-xs font-medium text-white">
                  Popular
                </span>
              ) : null}
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
              ) : isCurrentPlan ? (
                <Link
                  href="/dashboard/profile"
                  className="mt-6 flex h-10 w-full items-center justify-center rounded-none text-sm font-medium border border-amber-500/50 bg-amber-500/10 text-amber-200 transition-colors hover:border-amber-400/60 hover:bg-amber-500/20"
                >
                  Current plan
                </Link>
              ) : hasActivePaidPlan ? (
                <button
                  type="button"
                  onClick={() => {
                    setChangePlanTarget(plan.id as "starter" | "pro" | "business");
                    setChangePlanModalOpen(true);
                  }}
                  disabled={changingPlanId !== null}
                  className={`mt-6 flex h-10 w-full cursor-pointer items-center justify-center gap-2 rounded-none text-sm font-medium transition-colors ${
                    plan.featured
                      ? "bg-emerald-500 text-white hover:bg-emerald-600 disabled:opacity-70"
                      : "border border-white/20 bg-white/5 text-white hover:bg-white/10 disabled:opacity-70"
                  }`}
                >
                  {changingPlanId === plan.id ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Changing…
                    </>
                  ) : (
                    `Change to ${plan.name}`
                  )}
                </button>
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
          );
          })}
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
                    <td className="px-4 py-3.5 text-sm text-zinc-300">
                      <div className="flex items-center gap-2">
                        <span>{row.name}</span>
                        {row.tooltip && <InfoTooltip text={row.tooltip} />}
                      </div>
                    </td>
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

      <ChangePlanModal
        open={changePlanModalOpen}
        onOpenChange={(open) => {
          setChangePlanModalOpen(open);
          if (!open) {
            setChangePlanTarget(null);
            setPreviewAmount(null);
            setPreviewError(null);
          }
        }}
        currentPlanName={PLANS.find((p) => p.id === currentPlanId)?.name ?? "Current"}
        targetPlanName={changePlanTarget ? PLANS.find((p) => p.id === changePlanTarget)?.name ?? "" : ""}
        preview={previewAmount}
        previewLoading={previewLoading}
        previewError={!!previewError}
        changing={changingPlanId !== null}
        onConfirm={() => changePlanTarget && handleChangePlan(changePlanTarget)}
      />
    </>
  );
}
