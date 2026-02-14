/**
 * Client-side hooks for plan-based feature access
 * Use these in React components to check feature availability and show conditional UI
 *
 * Example usage:
 * ```tsx
 * const { hasFeature, getLimit } = usePlanFeatures();
 *
 * if (!hasFeature("csvExport")) {
 *   return <UpgradePrompt feature="csvExport" />;
 * }
 * ```
 */

"use client";

import { useMemo } from "react";
import { useUserStore } from "@/stores/useUserStore";
import type { PlanSlug } from "@/lib/db/schemas/user";
import type { PlanFeatureSet } from "@/lib/plans/plan-features";
import {
  hasFeature as hasFeatureLib,
  getFeatureLimit as getFeatureLimitLib,
  requiresUpgrade as requiresUpgradeLib,
  getPlanFeature as getPlanFeatureLib,
} from "@/lib/plans/plan-features";

/**
 * Hook to check feature availability for current user
 */
export function usePlanFeatures() {
  const { user } = useUserStore();
  const plan = (user?.plan?.toLowerCase() as PlanSlug) || "free";

  return useMemo(
    () => ({
      plan,
      /**
       * Check if current user has access to a feature
       */
      hasFeature: (featureKey: keyof PlanFeatureSet): boolean => {
        return hasFeatureLib(plan, featureKey);
      },

      /**
       * Get the limit value for a feature
       */
      getLimit: (featureKey: keyof PlanFeatureSet): string | number | null => {
        return getFeatureLimitLib(plan, featureKey);
      },

      /**
       * Check if feature requires an upgrade
       */
      requiresUpgrade: (featureKey: keyof PlanFeatureSet): boolean => {
        return requiresUpgradeLib(plan, featureKey);
      },

      /**
       * Get full feature object with details
       */
      getFeature: (featureKey: keyof PlanFeatureSet) => {
        return getPlanFeatureLib(plan, featureKey);
      },

      /**
       * Get detailed access information
       */
      getAccessInfo: (featureKey: keyof PlanFeatureSet, currentValue?: number) => {
        const feature = getPlanFeatureLib(plan, featureKey);
        const limit = getFeatureLimitLib(plan, featureKey);
        return {
          available: feature?.available ?? false,
          limit,
          currentValue,
        };
      },

      /**
       * Check if feature is available in current or higher plans
       */
      canUpgradeTo: (featureKey: keyof PlanFeatureSet): boolean => {
        const plans: PlanSlug[] = ["free", "starter", "pro", "business"];
        const currentIndex = plans.indexOf(plan);
        for (let i = currentIndex + 1; i < plans.length; i++) {
          if (hasFeatureLib(plans[i], featureKey)) {
            return true;
          }
        }
        return false;
      },
    }),
    [plan]
  );
}

/**
 * Hook to check if feature is available and show upgrade info
 */
export function useFeatureAvailability(featureKey: keyof PlanFeatureSet) {
  const { plan, getAccessInfo, hasFeature: hasFeatureCheck, canUpgradeTo } = usePlanFeatures();

  return useMemo(
    () => ({
      available: hasFeatureCheck(featureKey),
      canUpgrade: canUpgradeTo(featureKey),
      requiresUpgrade: !hasFeatureCheck(featureKey),
      info: getAccessInfo(featureKey),
      plan,
    }),
    [featureKey, plan, getAccessInfo, hasFeatureCheck, canUpgradeTo]
  );
}

/**
 * Hook to check feature availability with usage limits
 */
export function useFeatureWithLimit(
  featureKey: keyof PlanFeatureSet,
  currentUsage?: number
) {
  const { plan, getAccessInfo } = usePlanFeatures();

  return useMemo(
    () => {
      const accessInfo = getAccessInfo(featureKey, currentUsage);
      return {
        ...accessInfo,
        plan,
        currentUsage,
        percentageUsed:
          currentUsage !== undefined && typeof accessInfo.limit === "number"
            ? Math.round((currentUsage / accessInfo.limit) * 100)
            : null,
        remainingCount:
          currentUsage !== undefined && typeof accessInfo.limit === "number"
            ? accessInfo.limit - currentUsage
            : null,
      };
    },
    [featureKey, currentUsage, plan, getAccessInfo]
  );
}

/**
 * Hook to get all features available in current plan
 */
export function usePlanComparison() {
  const { plan } = usePlanFeatures();

  return useMemo(
    () => {
      // Import at runtime to avoid circular dependencies
      const { getPlanFeatures } = require("@/lib/plans/plan-features");
      const features = getPlanFeatures(plan);

      const available = Object.entries(features)
        .filter(([, feature]) => (feature as any).available === true)
        .map(([key, feature]) => ({
          key,
          ...(feature as any),
        }));

      const unavailable = Object.entries(features)
        .filter(([, feature]) => (feature as any).available === false)
        .map(([key, feature]) => ({
          key,
          ...(feature as any),
        }));

      return {
        plan,
        available,
        unavailable,
        totalFeatures: available.length + unavailable.length,
        availableCount: available.length,
      };
    },
    [plan]
  );
}

/**
 * Hook to check multiple features at once
 */
export function useMultipleFeatures(
  featureKeys: (keyof PlanFeatureSet)[]
) {
  const { hasFeature: hasFeatureCheck, getAccessInfo } = usePlanFeatures();

  return useMemo(
    () => {
      const results = featureKeys.map((key) => ({
        feature: key,
        available: hasFeatureCheck(key),
        info: getAccessInfo(key),
      }));

      return {
        features: results,
        allAvailable: results.every((r) => r.available),
        anyAvailable: results.some((r) => r.available),
        unavailableCount: results.filter((r) => !r.available).length,
      };
    },
    [featureKeys, hasFeatureCheck, getAccessInfo]
  );
}

/**
 * Hook to determine upgrade path for a feature
 */
export function useUpgradePath(featureKey: keyof PlanFeatureSet) {
  const { plan } = usePlanFeatures();

  return useMemo(() => {
    const plans: PlanSlug[] = ["free", "starter", "pro", "business"];
    const planNames = {
      free: "Free",
      starter: "Starter",
      pro: "Pro",
      business: "Business",
    };
    const planPrices = {
      free: "Free",
      starter: "$4.99/month",
      pro: "$11.99/month",
      business: "$29.99/month",
    };

    const currentIndex = plans.indexOf(plan);

    for (let i = currentIndex + 1; i < plans.length; i++) {
      const { hasFeature } = require("@/lib/plans/plan-features");
      if (hasFeature(plans[i], featureKey)) {
        return {
          currentPlan: plan,
          requiredPlan: plans[i],
          requiredPlanName: planNames[plans[i]],
          requiredPlanPrice: planPrices[plans[i]],
          upgradeSteps: i - currentIndex,
        };
      }
    }

    return null;
  }, [featureKey, plan]);
}
