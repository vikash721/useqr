/**
 * Feature gate components
 * Reusable components to show/hide UI based on plan features
 */

"use client";

import type { ReactNode } from "react";
import { usePlanFeatures, useFeatureAvailability } from "@/hooks/usePlanFeatures";
import type { PlanFeatureSet } from "@/lib/plans/plan-features";
import { Lock, Zap } from "lucide-react";
import Link from "next/link";

/**
 * Component to conditionally render content based on feature availability
 *
 * Example:
 * ```tsx
 * <FeatureGate feature="csvExport">
 *   <button>Export as CSV</button>
 *   <p slot="fallback">Upgrade to Pro to export as CSV</p>
 * </FeatureGate>
 * ```
 */
export function FeatureGate({
  feature,
  children,
  fallback,
  showUpgradeButton = true,
}: {
  feature: keyof PlanFeatureSet;
  children: ReactNode;
  fallback?: ReactNode;
  showUpgradeButton?: boolean;
}) {
  const { available } = useFeatureAvailability(feature);

  if (!available) {
    if (fallback) {
      return <>{fallback}</>;
    }

    if (showUpgradeButton) {
      return (
        <div className="flex items-center gap-2 rounded-lg border border-amber-500/20 bg-amber-500/5 px-3 py-2 text-sm text-amber-700">
          <Lock className="size-4" />
          <span>Upgrade to access this feature</span>
          <Link
            href="/dashboard/pricing"
            className="ml-auto font-medium text-amber-600 hover:text-amber-700"
          >
            View plans
          </Link>
        </div>
      );
    }

    return null;
  }

  return <>{children}</>;
}

/**
 * Component to show when a feature is locked
 */
export function FeatureLocked({
  feature,
  showLink = true,
}: {
  feature: keyof PlanFeatureSet;
  showLink?: boolean;
}) {
  const { info, plan } = useFeatureAvailability(feature);

  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-zinc-800 bg-zinc-900/50 px-6 py-8 text-center">
      <Lock className="mb-3 size-8 text-zinc-500" />
      <h3 className="mb-2 text-base font-semibold text-white">
        Feature Locked
      </h3>
      <p className="mb-4 text-sm text-zinc-400">
        This feature is not available in your <span className="capitalize">{plan}</span> plan.
      </p>
      {showLink && (
        <Link
          href="/dashboard/pricing"
          className="inline-flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-emerald-700"
        >
          <Zap className="size-3" />
          Upgrade Now
        </Link>
      )}
    </div>
  );
}

/**
 * Component to show limit progress
 */
export function FeatureLimitProgress({
  feature,
  current,
  showPercentage = true,
}: {
  feature: keyof PlanFeatureSet;
  current: number;
  showPercentage?: boolean;
}) {
  const { getAccessInfo } = usePlanFeatures();
  const info = getAccessInfo(feature, current);

  if (!info.available || !info.limit || typeof info.limit !== "number") {
    return null;
  }

  const percentage = (current / info.limit) * 100;
  const isWarning = percentage > 75;
  const isExceeded = current >= info.limit;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="text-zinc-400">
          {feature.charAt(0).toUpperCase() + feature.slice(1)}
        </span>
        <span className="font-medium text-zinc-200">
          {current}/{info.limit}
          {showPercentage && ` (${Math.round(percentage)}%)`}
        </span>
      </div>
      <div
        className={`h-1.5 overflow-hidden rounded-full ${
          isExceeded
            ? "bg-red-900/30"
            : isWarning
              ? "bg-amber-900/30"
              : "bg-zinc-800"
        }`}
      >
        <div
          className={`h-full transition-all ${
            isExceeded
              ? "bg-red-600"
              : isWarning
                ? "bg-amber-500"
                : "bg-emerald-500"
          }`}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      {isExceeded && (
        <p className="text-xs text-red-400">Limit exceeded. Upgrade for higher limits.</p>
      )}
      {isWarning && !isExceeded && (
        <p className="text-xs text-amber-400">
          {Math.round(info.limit - current)} remaining
        </p>
      )}
    </div>
  );
}

/**
 * Upgrade prompt component
 */
export function UpgradePrompt({
  feature,
  title,
  description,
}: {
  feature: keyof PlanFeatureSet;
  title?: string;
  description?: string;
}) {
  const { plan, requiresUpgrade } = useFeatureAvailability(feature);

  if (!requiresUpgrade) {
    return null;
  }

  return (
    <div className="rounded-lg border border-emerald-500/20 bg-emerald-500/5 p-4">
      <div className="flex items-start gap-3">
        <Zap className="mt-1 size-4 text-emerald-500 flex-shrink-0" />
        <div className="flex-1">
          <h3 className="font-semibold text-emerald-600">
            {title || "Upgrade to unlock this feature"}
          </h3>
          <p className="mt-1 text-sm text-emerald-700/80">
            {description ||
              `This feature is available in higher plans. Your current plan is ${plan}.`}
          </p>
          <Link
            href="/dashboard/pricing"
            className="mt-2 inline-block text-sm font-medium text-emerald-600 hover:text-emerald-700 underline"
          >
            See pricing plans →
          </Link>
        </div>
      </div>
    </div>
  );
}

/**
 * Feature badge showing plan requirement
 */
export function FeatureBadge({
  feature,
  showPlan = false,
}: {
  feature: keyof PlanFeatureSet;
  showPlan?: boolean;
}) {
  const { available, plan } = useFeatureAvailability(feature);

  if (!showPlan && available) {
    return null;
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
        available
          ? "bg-emerald-500/10 text-emerald-600"
          : "bg-amber-500/10 text-amber-600"
      }`}
    >
      {!available && <Lock className="size-3" />}
      {available ? "Included" : "Upgrade"}
      {showPlan && !available && ` (${plan})`}
    </span>
  );
}

/**
 * Plan comparison feature row
 */
export function FeatureRow({
  feature,
  plans = ["free", "starter", "pro", "business"],
}: {
  feature: keyof PlanFeatureSet;
  plans?: Array<"free" | "starter" | "pro" | "business">;
}) {
  const { getAccessInfo } = usePlanFeatures();

  return (
    <div className="flex items-center gap-4 border-b border-zinc-800 py-3">
      <div className="min-w-[200px] text-sm font-medium text-zinc-300">
        {feature}
      </div>
      <div className="flex flex-1 gap-4">
        {plans.map((plan) => {
          const info = getAccessInfo(feature, undefined);
          const { hasFeature } = require("@/lib/plans/plan-features");
          const has = hasFeature(plan, feature);

          return (
            <div
              key={plan}
              className={`flex-1 text-center text-xs ${
                has ? "text-emerald-400" : "text-zinc-600"
              }`}
            >
              {has ? "✓" : "—"}
            </div>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Disabled button with feature gate
 */
export function FeatureGateButton({
  feature,
  children,
  disabled = false,
  onClick,
  ...props
}: {
  feature: keyof PlanFeatureSet;
  children: ReactNode;
  disabled?: boolean;
  onClick?: () => void;
} & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  const { available, requiresUpgrade } = useFeatureAvailability(feature);

  const isDisabled = disabled || !available;

  return (
    <>
      <button
        {...props}
        disabled={isDisabled}
        onClick={isDisabled ? undefined : onClick}
        className={`relative ${props.className || ""}`}
        title={
          isDisabled && requiresUpgrade ? "Upgrade your plan to use this feature" : ""
        }
      >
        {children}
        {isDisabled && (
          <Lock className="absolute inset-y-0 right-2 my-auto size-4 text-zinc-500" />
        )}
      </button>
      {requiresUpgrade && (
        <p className="mt-1 text-xs text-zinc-500">
          Available in higher plans
        </p>
      )}
    </>
  );
}
