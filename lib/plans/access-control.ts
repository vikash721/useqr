/**
 * Plan-based access control utilities
 * Server-side access checking and permission validation
 *
 * Use these utilities in API routes and server actions to enforce plan-based restrictions
 */

import type { PlanSlug } from "@/lib/db/schemas/user";
import type { PlanFeatureSet } from "./plan-features";
import {
  PLAN_CONFIG,
  hasFeature,
  getFeatureLimit,
  requiresUpgrade,
} from "./plan-features";

/**
 * Error thrown when user tries to access a feature not available in their plan
 */
export class FeatureNotAvailableError extends Error {
  constructor(
    public featureKey: keyof PlanFeatureSet,
    public currentPlan: PlanSlug,
    public requiredPlan?: PlanSlug
  ) {
    const message = `Feature "${featureKey}" is not available in the "${currentPlan}" plan.`;
    super(message);
    this.name = "FeatureNotAvailableError";
  }
}

/**
 * Error thrown when user exceeds plan limits
 */
export class LimitExceededError extends Error {
  constructor(
    public featureKey: keyof PlanFeatureSet,
    public limit: string | number,
    public currentValue: number
  ) {
    const message = `Exceeded limit for "${featureKey}". Limit: ${limit}, Current: ${currentValue}`;
    super(message);
    this.name = "LimitExceededError";
  }
}

/**
 * Check if user has access to a feature
 * @throws FeatureNotAvailableError if feature is not available in the plan
 * @param plan - The user's plan
 * @param featureKey - The feature to check
 * @returns true if user has access
 */
export function requireFeature(
  plan: PlanSlug,
  featureKey: keyof PlanFeatureSet
): boolean {
  if (!hasFeature(plan, featureKey)) {
    throw new FeatureNotAvailableError(featureKey, plan);
  }
  return true;
}

/**
 * Get next plan that has the requested feature
 * @param currentPlan - The user's current plan
 * @param featureKey - The feature to check
 * @returns The minimum plan needed for the feature, or null if already available
 */
export function getUpgradePath(
  currentPlan: PlanSlug,
  featureKey: keyof PlanFeatureSet
): PlanSlug | null {
  if (hasFeature(currentPlan, featureKey)) {
    return null; // Already has access
  }

  // Find the next available plan with this feature
  const plans: PlanSlug[] = ["free", "starter", "pro", "business"];
  const currentIndex = plans.indexOf(currentPlan);

  for (let i = currentIndex + 1; i < plans.length; i++) {
    const plan = plans[i];
    if (hasFeature(plan, featureKey)) {
      return plan;
    }
  }

  return null;
}

/**
 * Check a numeric limit for a feature
 * @throws LimitExceededError if current value exceeds the limit
 * @param plan - The user's plan
 * @param featureKey - The feature to check
 * @param currentValue - The current usage count
 * @returns true if within limit
 */
export function checkFeatureLimit(
  plan: PlanSlug,
  featureKey: keyof PlanFeatureSet,
  currentValue: number
): boolean {
  const limit = getFeatureLimit(plan, featureKey);

  // If no limit defined or not a number, allow
  if (!limit || typeof limit !== "number") {
    return true;
  }

  if (currentValue >= limit) {
    throw new LimitExceededError(featureKey, limit, currentValue);
  }

  return true;
}

/**
 * Safe version of checkFeatureLimit that returns boolean instead of throwing
 * @param plan - The user's plan
 * @param featureKey - The feature to check
 * @param currentValue - The current usage count
 * @returns true if within limit, false if exceeded
 */
export function isWithinLimit(
  plan: PlanSlug,
  featureKey: keyof PlanFeatureSet,
  currentValue: number
): boolean {
  try {
    return checkFeatureLimit(plan, featureKey, currentValue);
  } catch {
    return false;
  }
}

/**
 * Context object for access check operations
 */
export interface AccessCheckContext {
  plan: PlanSlug;
  currentUsage?: { [key in keyof PlanFeatureSet]?: number };
}

/**
 * Comprehensive access check that validates both feature availability and limits
 * @param context - The access check context with plan and usage data
 * @param featureKey - The feature to check
 * @param currentValue - Optional current usage value for limit checking
 * @returns true if user has access
 * @throws FeatureNotAvailableError or LimitExceededError if access is denied
 */
export function checkAccess(
  context: AccessCheckContext,
  featureKey: keyof PlanFeatureSet,
  currentValue?: number
): boolean {
  // Check feature availability
  requireFeature(context.plan, featureKey);

  // Check usage limit if currentValue provided
  if (currentValue !== undefined) {
    checkFeatureLimit(context.plan, featureKey, currentValue);
  }

  return true;
}

/**
 * Safe version of checkAccess that returns error details instead of throwing
 */
export function tryCheckAccess(
  context: AccessCheckContext,
  featureKey: keyof PlanFeatureSet,
  currentValue?: number
): {
  allowed: boolean;
  error?: Error;
  upgradeTo?: PlanSlug;
} {
  try {
    checkAccess(context, featureKey, currentValue);
    return { allowed: true };
  } catch (error) {
    if (error instanceof FeatureNotAvailableError) {
      return {
        allowed: false,
        error,
        upgradeTo: getUpgradePath(context.plan, featureKey) || undefined,
      };
    }
    if (error instanceof LimitExceededError) {
      return {
        allowed: false,
        error,
      };
    }
    return {
      allowed: false,
      error: error instanceof Error ? error : new Error(String(error)),
    };
  }
}

/**
 * Get detailed access information for a feature
 * @param plan - The user's plan
 * @param featureKey - The feature to check
 * @param currentValue - Optional current usage value
 * @returns Object with access details
 */
export function getAccessInfo(
  plan: PlanSlug,
  featureKey: keyof PlanFeatureSet,
  currentValue?: number
): {
  available: boolean;
  limit?: string | number;
  currentValue?: number;
  withinLimit: boolean;
  upgradePath?: PlanSlug;
} {
  const available = hasFeature(plan, featureKey);
  const limit = getFeatureLimit(plan, featureKey);

  let withinLimit = true;
  if (currentValue !== undefined && typeof limit === "number") {
    withinLimit = currentValue < limit;
  }

  const upgradePath = !available ? getUpgradePath(plan, featureKey) : undefined;

  return {
    available,
    ...(limit ? { limit } : {}),
    ...(currentValue !== undefined ? { currentValue } : {}),
    withinLimit,
    ...(upgradePath ? { upgradePath } : {}),
  };
}
