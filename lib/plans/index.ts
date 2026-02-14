/**
 * Plan-based access control system - main export file
 * 
 * This file serves as the public API for the plan-based access control system.
 * Import from '@/lib/plans' to access all plan-related functionality.
 *
 * Example:
 * ```typescript
 * import {
 *   hasFeature,
 *   checkAccess,
 *   requireFeature,
 *   createFeatureNotAvailableResponse,
 * } from "@/lib/plans";
 * ```
 */

// Plan feature configuration
export {
  PLAN_CONFIG,
  type Feature,
  type PlanFeatureSet,
  type Plan,
  getPlanFeatures,
  getPlanFeature,
  hasFeature,
  getFeatureLimit,
  requiresUpgrade,
  getAvailableFeatures,
  hasFeatureInAnyPlan,
  getMaxFeatureLimit,
  getMinimumPlanForFeature,
} from "./plan-features";

// Access control utilities
export {
  FeatureNotAvailableError,
  LimitExceededError,
  requireFeature,
  getUpgradePath,
  checkFeatureLimit,
  isWithinLimit,
  checkAccess,
  tryCheckAccess,
  getAccessInfo,
  type AccessCheckContext,
} from "./access-control";

// Middleware and API helpers
export {
  createFeatureNotAvailableResponse,
  createLimitExceededResponse,
  createAccessDeniedResponse,
  createPlanAwareHandler,
  type AccessControlOptions,
  type AccessControlContext,
  type ControlledResponse,
} from "./middleware";
