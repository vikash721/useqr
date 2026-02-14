/**
 * API middleware for plan-based access control
 * Use these middleware functions in API routes to enforce plan-based restrictions
 *
 * Example usage in an API route:
 * ```typescript
 * export async function POST(request: Request) {
 *   const user = await currentUser();
 *   const userDoc = await getUserByClerkId(user.id);
 *   try {
 *     requireFeature(userDoc.plan, "csvExport");
 *   } catch (err) {
 *     return createFeatureNotAvailableResponse(userDoc.plan, "csvExport");
 *   }
 *   // ... rest of API logic
 * }
 * ```
 */

import { NextResponse } from "next/server";
import type { PlanSlug } from "@/lib/db/schemas/user";
import type { PlanFeatureSet } from "./plan-features";
import {
  FeatureNotAvailableError,
  LimitExceededError,
  getUpgradePath,
  getAccessInfo,
} from "./access-control";

/**
 * Standard error response for feature not available
 */
export function createFeatureNotAvailableResponse(
  currentPlan: PlanSlug,
  featureKey: keyof PlanFeatureSet,
  status: number = 403
) {
  const upgradePath = getUpgradePath(currentPlan, featureKey);
  const accessInfo = getAccessInfo(currentPlan, featureKey);

  return NextResponse.json(
    {
      error: "Feature not available",
      code: "FEATURE_NOT_AVAILABLE",
      feature: featureKey,
      currentPlan,
      upgradeTo: upgradePath,
      details: {
        available: accessInfo.available,
        limit: accessInfo.limit,
        ...(upgradePath ? { requiredPlan: upgradePath } : {}),
      },
    },
    { status }
  );
}

/**
 * Standard error response for limit exceeded
 */
export function createLimitExceededResponse(
  featureKey: keyof PlanFeatureSet,
  limit: string | number,
  currentValue: number,
  status: number = 429
) {
  return NextResponse.json(
    {
      error: "Limit exceeded",
      code: "LIMIT_EXCEEDED",
      feature: featureKey,
      limit,
      currentValue,
    },
    { status }
  );
}

/**
 * Middleware function to wrap API route handlers with plan-based access control
 *
 * Example:
 * ```typescript
 * export const POST = withAccessControl(
 *   async (request: Request, { plan, clerkId }) => {
 *     // ... your handler logic
 *   },
 *   {
 *     requiredFeatures: ["csvExport"],
 *     requireAuth: true,
 *   }
 * );
 * ```
 */
export interface AccessControlOptions {
  /** Features required for this endpoint */
  requiredFeatures?: (keyof PlanFeatureSet)[];
  /** Whether authentication is required (default: true) */
  requireAuth?: boolean;
}

export interface AccessControlContext {
  plan: PlanSlug;
  clerkId: string;
}

/**
 * Response objects for handler
 */
export interface ControlledResponse {
  ok: boolean;
  status: number;
  body: any;
}

/**
 * Create a plan-aware API handler wrapper
 * @param handler - The actual route handler
 * @param options - Access control options
 * @returns A Next.js API route handler
 */
export function createPlanAwareHandler<T extends any[], R>(
  handler: (request: Request, context: AccessControlContext) => Promise<R>,
  options: AccessControlOptions = {}
) {
  return async (request: Request) => {
    const { requiredFeatures = [], requireAuth = true } = options;

    // Import here to avoid circular dependencies at module load time
    const { currentUser } = await import("@clerk/nextjs/server");
    const { getUserByClerkId } = await import("@/lib/db/users");

    // Check auth if required
    if (requireAuth) {
      const clerkUser = await currentUser();
      if (!clerkUser?.id) {
        return NextResponse.json(
          { error: "Unauthorized" },
          { status: 401 }
        );
      }

      // Check plan features
      const userDoc = await getUserByClerkId(clerkUser.id);
      if (!userDoc) {
        return NextResponse.json(
          { error: "User not found" },
          { status: 404 }
        );
      }

      // Verify all required features
      for (const featureKey of requiredFeatures) {
        try {
          const { checkAccess } = await import("./access-control");
          checkAccess({ plan: userDoc.plan }, featureKey);
        } catch (error) {
          if (error instanceof FeatureNotAvailableError) {
            return createFeatureNotAvailableResponse(
              userDoc.plan,
              featureKey,
              403
            );
          }
          if (error instanceof LimitExceededError) {
            return createLimitExceededResponse(
              error.featureKey,
              error.limit,
              error.currentValue,
              429
            );
          }
          throw error;
        }
      }

      // Call handler with context
      return handler(request, {
        plan: userDoc.plan,
        clerkId: clerkUser.id,
      });
    }

    // If no auth required, still get context if possible
    const clerkUser = await currentUser();
    const userDoc = clerkUser?.id ? await getUserByClerkId(clerkUser.id) : null;

    if (!clerkUser?.id || !userDoc) {
      return handler(request, {
        plan: "free",
        clerkId: clerkUser?.id || "",
      });
    }

    return handler(request, {
      plan: userDoc.plan,
      clerkId: clerkUser.id,
    });
  };
}

/**
 * Helper to create a unified error response that handles both feature and limit errors
 */
export function createAccessDeniedResponse(
  error: Error,
  currentPlan: PlanSlug
): NextResponse {
  if (error instanceof FeatureNotAvailableError) {
    return createFeatureNotAvailableResponse(
      currentPlan,
      error.featureKey,
      403
    );
  }

  if (error instanceof LimitExceededError) {
    return createLimitExceededResponse(
      error.featureKey,
      error.limit,
      error.currentValue,
      429
    );
  }

  return NextResponse.json(
    { error: "Access denied" },
    { status: 403 }
  );
}
