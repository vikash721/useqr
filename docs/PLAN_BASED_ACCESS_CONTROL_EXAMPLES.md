/**
 * QUICK REFERENCE GUIDE: Plan-Based Access Control
 * 
 * This file contains common usage patterns and examples.
 * Copy and adapt these patterns for your own use cases.
 */

// ============================================================================
// 1. SERVER-SIDE: API ROUTE PROTECTION
// ============================================================================

/**
 * Example: Protect an API route that requires a specific feature
 */
/*
// File: app/api/analytics/export/route.ts

import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { getUserByClerkId } from "@/lib/db/users";
import { checkAccess, FeatureNotAvailableError, LimitExceededError } from "@/lib/plans/access-control";
import { createFeatureNotAvailableResponse, createLimitExceededResponse } from "@/lib/plans/middleware";

export async function POST(request: Request) {
  const user = await currentUser();
  if (!user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userDoc = await getUserByClerkId(user.id);
  if (!userDoc) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  // Check if user has CSV export feature
  try {
    checkAccess({ plan: userDoc.plan }, "csvExport");
  } catch (err) {
    if (err instanceof FeatureNotAvailableError) {
      return createFeatureNotAvailableResponse(userDoc.plan, "csvExport");
    }
    if (err instanceof LimitExceededError) {
      return createLimitExceededResponse(err.featureKey, err.limit, err.currentValue);
    }
    throw err;
  }

  // Process export...
  return NextResponse.json({ ok: true, data: [] });
}
*/

// ============================================================================
// 2. SERVER-SIDE: FEATURE FLAG WITH FALLBACK
// ============================================================================

/**
 * Example: Check feature without throwing - useful for graceful degradation
 */
/*
import { tryCheckAccess, getAccessInfo } from "@/lib/plans/access-control";

export async function GET(request: Request) {
  const user = await currentUser();
  const userDoc = await getUserByClerkId(user.id);

  const result = tryCheckAccess({ plan: userDoc.plan }, "geoFencedQR");
  
  if (!result.allowed) {
    // Feature not available - return basic QR data without geo-fencing
    return NextResponse.json({
      qrData: basicQR,
      warning: `Geo-fencing requires ${result.upgradeTo || "Business"} plan`
    });
  }

  // Feature available - return full QR with geo-fencing
  return NextResponse.json({
    qrData: geoFencedQR,
  });
}
*/

// ============================================================================
// 3. CLIENT-SIDE: CONDITIONAL RENDERING
// ============================================================================

/**
 * Example: Show/hide features based on plan
 */
/*
"use client";

import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { UpgradePrompt } from "@/components/FeatureGate";

export function AnalyticsPanel() {
  const { hasFeature, getLimit } = usePlanFeatures();

  return (
    <div className="space-y-4">
      {hasFeature("scanAnalytics") ? (
        <>
          <h2>Scan Analytics</h2>
          <p>Data retention: {getLimit("scanAnalytics")}</p>
          
          {hasFeature("csvExport") && (
            <button className="btn">Download as CSV</button>
          )}
          
          {!hasFeature("csvExport") && (
            <UpgradePrompt 
              feature="csvExport"
              title="CSV Export available in Pro"
            />
          )}
        </>
      ) : (
        <UpgradePrompt feature="scanAnalytics" />
      )}
    </div>
  );
}
*/

// ============================================================================
// 4. CLIENT-SIDE: USAGE LIMITS
// ============================================================================

/**
 * Example: Show usage progress and warnings
 */
/*
"use client";

import { useFeatureWithLimit } from "@/hooks/usePlanFeatures";
import { FeatureLimitProgress } from "@/components/FeatureGate";

export function QRCreationForm({ userQRCount }: { userQRCount: number }) {
  const qrLimitInfo = useFeatureWithLimit("qrCodesIncluded", userQRCount);

  return (
    <div className="space-y-4">
      <FeatureLimitProgress 
        feature="qrCodesIncluded" 
        current={userQRCount}
        showPercentage={true}
      />

      {qrLimitInfo.percentageUsed && qrLimitInfo.percentageUsed > 75 && (
        <div className="alert alert-warning">
          You've used {qrLimitInfo.percentageUsed}% of your QR limit.
          {qrLimitInfo.remainingCount === 0 && (
            <a href="/dashboard/pricing" className="btn btn-sm">
              Upgrade for more
            </a>
          )}
        </div>
      )}

      <button 
        disabled={!qrLimitInfo.available || !qrLimitInfo.withinLimit}
        onClick={handleCreate}
      >
        Create New QR
      </button>
    </div>
  );
}
*/

// ============================================================================
// 5. ADDING A NEW FEATURE: STEP-BY-STEP
// ============================================================================

/**
 * Example: Adding "Advanced Analytics" feature
 * 
 * Step 1: Update PlanFeatureSet interface in lib/plans/plan-features.ts
 * 
 * export interface PlanFeatureSet {
 *   // ... existing features
 *   advancedAnalytics: Feature; // ADD THIS
 * }
 * 
 * Step 2: Add to PLAN_CONFIG
 * 
 * export const PLAN_CONFIG: Record<Plan, PlanFeatureSet> = {
 *   free: {
 *     // ... existing
 *     advancedAnalytics: { id: "advanced-analytics", name: "Advanced Analytics", available: false },
 *   },
 *   starter: {
 *     // ... existing
 *     advancedAnalytics: { id: "advanced-analytics", name: "Advanced Analytics", available: false },
 *   },
 *   pro: {
 *     // ... existing
 *     advancedAnalytics: { id: "advanced-analytics", name: "Advanced Analytics", available: true },
 *   },
 *   business: {
 *     // ... existing
 *     advancedAnalytics: { id: "advanced-analytics", name: "Advanced Analytics", available: true },
 *   },
 * };
 * 
 * Step 3: Use in your code immediately!
 * 
 * // Server
 * requireFeature(userDoc.plan, "advancedAnalytics");
 * 
 * // Client
 * const { hasFeature } = usePlanFeatures();
 * if (hasFeature("advancedAnalytics")) { ... }
 * 
 * // UI
 * <FeatureGate feature="advancedAnalytics">
 *   <AdvancedAnalyticsUI />
 * </FeatureGate>
 */

// ============================================================================
// 6. DATABASE-DRIVEN PLANS (FUTURE-PROOF)
// ============================================================================

/**
 * Example: Extending to dynamic plans from database
 * 
 * This is a future enhancement - the current system uses static config,
 * but it can be extended to support database-driven plans.
 */
/*
// lib/plans/plan-features-dynamic.ts

import type { PlanSlug } from "@/lib/db/schemas/user";
import type { PlanFeatureSet } from "./plan-features";
import { PLAN_CONFIG as DEFAULT_CONFIG } from "./plan-features";
import { cache } from "react";

// Cache the plan config for the request duration
const getPlanConfig = cache(async () => {
  // Could fetch from database here
  // const customPlans = await db.collection("plans").find().toArray();
  // return customPlans;
  
  // For now, use default static config
  return DEFAULT_CONFIG;
});

export async function getPlanFeaturesAsync(plan: PlanSlug): Promise<PlanFeatureSet> {
  const config = await getPlanConfig();
  return config[plan];
}

// Usage in API routes:
// const config = await getPlanFeaturesAsync(userDoc.plan);
*/

// ============================================================================
// 7. FEATURE ANALYTICS
// ============================================================================

/**
 * Example: Track feature usage for analytics
 */
/*
// lib/plans/feature-analytics.ts

import { db } from "@/lib/db";

export async function trackFeatureUsage(
  clerkId: string,
  feature: keyof PlanFeatureSet,
  metadata?: Record<string, any>
) {
  await db.collection("feature_usage").insertOne({
    clerkId,
    feature,
    timestamp: new Date(),
    metadata,
  });
}

// Usage:
// await trackFeatureUsage(user.id, "csvExport", { recordCount: 1000 });
*/

// ============================================================================
// 8. ERROR HANDLING PATTERNS
// ============================================================================

/**
 * Example: Comprehensive error handling
 */
/*
import { FeatureNotAvailableError, LimitExceededError } from "@/lib/plans/access-control";
import { getUpgradePath } from "@/lib/plans/access-control";

export async function createAdvancedQR(data: QRData, userDoc: UserDocument) {
  try {
    // Check feature availability
    checkAccess({ plan: userDoc.plan }, "advancedFeature");
  } catch (err) {
    if (err instanceof FeatureNotAvailableError) {
      const upgradePath = getUpgradePath(userDoc.plan, err.featureKey);
      return {
        error: "FEATURE_NOT_AVAILABLE",
        message: `This feature is available in the ${upgradePath} plan`,
        upgradeTo: upgradePath,
      };
    }
    
    if (err instanceof LimitExceededError) {
      return {
        error: "LIMIT_EXCEEDED",
        message: `You've reached your ${err.featureKey} limit of ${err.limit}`,
        current: err.currentValue,
        limit: err.limit,
      };
    }
  }

  // Proceed with creating QR
  return { ok: true, qr: createdQR };
}
*/

// ============================================================================
// 9. TESTING PATTERNS
// ============================================================================

/**
 * Example: Unit tests for feature access
 */
/*
import { hasFeature, checkAccess, FeatureNotAvailableError } from "@/lib/plans/access-control";

describe("Plan-based Access Control", () => {
  describe("hasFeature", () => {
    it("should return true for available features", () => {
      expect(hasFeature("pro", "csvExport")).toBe(true);
      expect(hasFeature("business", "ssoSAML")).toBe(true);
    });

    it("should return false for unavailable features", () => {
      expect(hasFeature("free", "csvExport")).toBe(false);
      expect(hasFeature("starter", "ssoSAML")).toBe(false);
    });
  });

  describe("checkAccess", () => {
    it("should throw for unavailable features", () => {
      expect(() => {
        checkAccess({ plan: "free" }, "csvExport");
      }).toThrow(FeatureNotAvailableError);
    });

    it("should not throw for available features", () => {
      expect(() => {
        checkAccess({ plan: "pro" }, "csvExport");
      }).not.toThrow();
    });

    it("should check usage limits", () => {
      expect(() => {
        checkAccess({ plan: "free" }, "qrCodesIncluded", 10);
      }).toThrow(LimitExceededError);

      expect(() => {
        checkAccess({ plan: "free" }, "qrCodesIncluded", 3);
      }).not.toThrow();
    });
  });
});

// Integration test example
describe("QR Creation with Plan Restrictions", () => {
  it("should prevent creating more QRs than plan allows", async () => {
    const response = await fetch("/api/qrs", {
      method: "POST",
      body: JSON.stringify(qrData),
      headers: { "Content-Type": "application/json" },
    });

    expect(response.status).toBe(429); // Limit exceeded
    const data = await response.json();
    expect(data.code).toBe("LIMIT_EXCEEDED");
  });

  it("should allow features for paid plans", async () => {
    // Mock pro plan user
    const response = await fetch("/api/qrs/export", {
      method: "POST",
    });

    expect(response.status).toBe(200);
  });
});
*/

// ============================================================================
// 10. MIGRATION CHECKLIST
// ============================================================================

/**
 * Checklist for migrating existing feature checks to the new system:
 * 
 * - [ ] Add all features to PLAN_CONFIG
 * - [ ] Replace plan === checks with hasFeature()
 * - [ ] Replace hard-coded limits with getFeatureLimit()
 * - [ ] Add feature checks to API routes that need them
 * - [ ] Replace UI feature gates with <FeatureGate /> components
 * - [ ] Update error handling to use FeatureNotAvailableError
 * - [ ] Add limit progress indicators with FeatureLimitProgress
 * - [ ] Update tests to use the new system
 * - [ ] Document all features in PLAN_CONFIG
 * - [ ] Review all customer-facing error messages
 */

export {};
