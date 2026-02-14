# Plan-Based Access Control System

A production-grade, scalable system for implementing plan-based feature restrictions in UseQR. This system is designed to be future-proof, allowing new features to be added seamlessly without changing core logic.

## Architecture Overview

The system consists of four main layers:

1. **Plan Configuration** (`lib/plans/plan-features.ts`) - Single source of truth for all plan features
2. **Access Control Logic** (`lib/plans/access-control.ts`) - Server-side feature checking and validation
3. **API Middleware** (`lib/plans/middleware.ts`) - Next.js API route helpers
4. **Client-Side Hooks** (`hooks/usePlanFeatures.ts`) - React hooks for UI integration
5. **UI Components** (`components/FeatureGate.tsx`) - Pre-built feature gating components

## Quick Start

### 1. Check Feature Availability (Server-Side)

```typescript
import { requireFeature, checkAccess } from "@/lib/plans/access-control";

// In your API route
const user = await currentUser();
const userDoc = await getUserByClerkId(user.id);

// Will throw FeatureNotAvailableError if not available
requireFeature(userDoc.plan, "csvExport");

// Or check without throwing
const access = tryCheckAccess({ plan: userDoc.plan }, "csvExport");
if (!access.allowed) {
  return createFeatureNotAvailableResponse(userDoc.plan, "csvExport");
}
```

### 2. Check Feature Availability (Client-Side)

```typescript
"use client";

import { usePlanFeatures } from "@/hooks/usePlanFeatures";

export function MyComponent() {
  const { hasFeature, getLimit, requiresUpgrade } = usePlanFeatures();

  if (!hasFeature("csvExport")) {
    return <UpgradePrompt feature="csvExport" />;
  }

  const limit = getLimit("qrCodesIncluded");
  return <div>You can create up to {limit} QR codes</div>;
}
```

### 3. Use Feature Gate Components

```typescript
import { FeatureGate, UpgradePrompt } from "@/components/FeatureGate";

export function ExportButton() {
  return (
    <FeatureGate feature="csvExport">
      <button>Export as CSV</button>
      <UpgradePrompt
        slot="fallback"
        feature="csvExport"
        title="CSV Export is a Pro feature"
      />
    </FeatureGate>
  );
}
```

## Adding New Features

The system is designed to be extended with minimal changes. Here's how to add a new feature:

### Step 1: Define the Feature in Plan Config

Edit `lib/plans/plan-features.ts` and add to the `PlanFeatureSet` interface:

```typescript
export interface PlanFeatureSet {
  // ... existing features
  myNewFeature: Feature; // Add here
}
```

### Step 2: Add Feature to All Plan Configs

Update the `PLAN_CONFIG` object:

```typescript
export const PLAN_CONFIG: Record<Plan, PlanFeatureSet> = {
  free: {
    // ... existing features
    myNewFeature: {
      id: "my-new-feature",
      name: "My New Feature",
      available: false,
    },
  },
  starter: {
    // ... existing features
    myNewFeature: {
      id: "my-new-feature",
      name: "My New Feature",
      available: true,
    },
  },
  pro: {
    // ... existing features
    myNewFeature: {
      id: "my-new-feature",
      name: "My New Feature",
      available: true,
    },
  },
  business: {
    // ... existing features
    myNewFeature: {
      id: "my-new-feature",
      name: "My New Feature",
      available: true,
    },
  },
};
```

### Step 3: Use in Your Code

Now you can use the feature everywhere:

```typescript
// Server-side
requireFeature(userDoc.plan, "myNewFeature");

// Client-side
const { hasFeature } = usePlanFeatures();
if (!hasFeature("myNewFeature")) {
  return <UpgradePrompt feature="myNewFeature" />;
}

// UI
<FeatureGate feature="myNewFeature">
  <MyNewFeatureUI />
</FeatureGate>
```

## API Reference

### Plan Features Configuration

#### `getPlanFeatures(plan: Plan): PlanFeatureSet`
Get all features for a specific plan.

```typescript
const features = getPlanFeatures("pro");
console.log(features.csvExport.available); // true
```

#### `getPlanFeature(plan: Plan, featureKey: keyof PlanFeatureSet): Feature | null`
Get a specific feature for a plan.

```typescript
const feature = getPlanFeature("starter", "csvExport");
console.log(feature?.available); // false
```

#### `hasFeature(plan: Plan, featureKey: keyof PlanFeatureSet): boolean`
Check if a feature is available in a plan.

```typescript
if (hasFeature(userDoc.plan, "csvExport")) {
  // User can export
}
```

#### `getFeatureLimit(plan: Plan, featureKey: keyof PlanFeatureSet): string | number | null`
Get the limit value for a feature.

```typescript
const limit = getFeatureLimit("pro", "teamMembers"); // 4
const qrLimit = getFeatureLimit("starter", "qrCodesIncluded"); // 25
```

### Access Control

#### `requireFeature(plan: PlanSlug, featureKey: keyof PlanFeatureSet): boolean`
Throw error if feature not available (use for strict validation).

```typescript
try {
  requireFeature(userDoc.plan, "csvExport");
} catch (err) {
  if (err instanceof FeatureNotAvailableError) {
    console.log(`Feature ${err.featureKey} not available in ${err.currentPlan}`);
  }
}
```

#### `checkAccess(context: AccessCheckContext, featureKey: keyof PlanFeatureSet, currentValue?: number): boolean`
Check both feature availability and usage limits.

```typescript
checkAccess({ plan: userDoc.plan }, "qrCodesIncluded", currentQRCount);
```

#### `tryCheckAccess(...): { allowed: boolean; error?: Error; upgradeTo?: PlanSlug }`
Safe version that returns result object instead of throwing.

```typescript
const result = tryCheckAccess({ plan: userDoc.plan }, "csvExport");
if (!result.allowed) {
  console.log(`Upgrade to ${result.upgradeTo} to access this feature`);
}
```

#### `getAccessInfo(plan: Plan, featureKey: keyof PlanFeatureSet, currentValue?: number)`
Get detailed access information.

```typescript
const info = getAccessInfo("pro", "qrCodesIncluded", 85);
// Returns: { available: true, limit: 100, currentValue: 85, withinLimit: true }
```

### React Hooks

#### `usePlanFeatures()`
Main hook for checking feature availability in React components.

```typescript
const { plan, hasFeature, getLimit, requiresUpgrade, getAccessInfo } = usePlanFeatures();

if (hasFeature("csvExport")) {
  // Show export button
}
```

#### `useFeatureAvailability(featureKey: keyof PlanFeatureSet)`
Check specific feature availability.

```typescript
const { available, requiresUpgrade, canUpgrade } = useFeatureAvailability("csvExport");
```

#### `useFeatureWithLimit(featureKey: keyof PlanFeatureSet, currentUsage?: number)`
Check feature with usage limits.

```typescript
const { available, limit, currentUsage, percentageUsed, remainingCount } = 
  useFeatureWithLimit("qrCodesIncluded", qrCount);

<div>You have created {currentUsage} of {limit} QR codes ({percentageUsed}%)</div>
```

#### `usePlanComparison()`
Get all features available and unavailable in current plan.

```typescript
const { plan, available, unavailable, availableCount, totalFeatures } = usePlanComparison();
```

#### `useMultipleFeatures(featureKeys: keyof PlanFeatureSet[])`
Check multiple features at once.

```typescript
const { features, allAvailable, anyAvailable, unavailableCount } = 
  useMultipleFeatures(["csvExport", "geoFencedQR"]);
```

#### `useUpgradePath(featureKey: keyof PlanFeatureSet)`
Determine which plan to upgrade to for a feature.

```typescript
const path = useUpgradePath("csvExport");
// Returns: { currentPlan: "starter", requiredPlan: "pro", requiredPlanPrice: "$11.99/month" }
```

### UI Components

#### `<FeatureGate feature={string}>`
Conditionally render content based on feature availability.

```typescript
<FeatureGate feature="csvExport">
  <button>Export as CSV</button>
  <UpgradePrompt slot="fallback" feature="csvExport" />
</FeatureGate>
```

#### `<FeatureLocked feature={string} />`
Show locked feature state.

```typescript
<FeatureLocked feature="geoFencedQR" />
```

#### `<FeatureLimitProgress feature={string} current={number} />`
Show usage progress with visual indicator.

```typescript
<FeatureLimitProgress feature="qrCodesIncluded" current={18} />
```

#### `<UpgradePrompt feature={string} />`
Show upgrade call-to-action.

```typescript
<UpgradePrompt 
  feature="csvExport" 
  title="CSV Export is a Pro feature"
  description="Upgrade to Pro to download your analytics as CSV"
/>
```

#### `<FeatureBadge feature={string} />`
Show feature availability badge.

```typescript
<FeatureBadge feature="csvExport" showPlan={true} />
```

#### `<FeatureGateButton feature={string}>`
Button that's disabled if feature not available.

```typescript
<FeatureGateButton feature="csvExport" onClick={handleExport}>
  Export
</FeatureGateButton>
```

## Integration Examples

### Example 1: API Route with Feature Check

```typescript
// app/api/qrs/export/route.ts
import { checkAccess, FeatureNotAvailableError } from "@/lib/plans/access-control";
import { createFeatureNotAvailableResponse } from "@/lib/plans/middleware";

export async function POST(request: Request) {
  const user = await currentUser();
  const userDoc = await getUserByClerkId(user.id);

  try {
    checkAccess({ plan: userDoc.plan }, "csvExport");
  } catch (err) {
    if (err instanceof FeatureNotAvailableError) {
      return createFeatureNotAvailableResponse(userDoc.plan, "csvExport");
    }
    throw err;
  }

  // Process export...
}
```

### Example 2: Component with Limits

```typescript
// components/QRCodeList.tsx
"use client";

import { useFeatureWithLimit } from "@/hooks/usePlanFeatures";
import { FeatureLimitProgress, UpgradePrompt } from "@/components/FeatureGate";

export function QRCodeList({ qrCount }: { qrCount: number }) {
  const qrLimit = useFeatureWithLimit("qrCodesIncluded", qrCount);

  if (!qrLimit.available) {
    return <UpgradePrompt feature="qrCodesIncluded" />;
  }

  return (
    <div>
      <FeatureLimitProgress feature="qrCodesIncluded" current={qrCount} />
      {qrLimit.remainingCount !== null && (
        <p className="text-sm text-zinc-400">
          {qrLimit.remainingCount} QR codes remaining
        </p>
      )}
    </div>
  );
}
```

### Example 3: Feature Selection Based on Plan

```typescript
// components/ExportOptions.tsx
"use client";

import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { FeatureGate } from "@/components/FeatureGate";

export function ExportOptions() {
  const { hasFeature } = usePlanFeatures();

  return (
    <div className="space-y-2">
      <button>Export as JSON</button>

      <FeatureGate feature="csvExport">
        <button>Export as CSV</button>
      </FeatureGate>

      {hasFeature("csvExport") && (
        <button>Download Advanced Report</button>
      )}
    </div>
  );
}
```

## Testing

### Test Feature Availability

```typescript
import { hasFeature, getFeatureLimit } from "@/lib/plans/plan-features";

describe("Plan Features", () => {
  test("Pro plan has CSV export", () => {
    expect(hasFeature("pro", "csvExport")).toBe(true);
  });

  test("Free plan doesn't have CSV export", () => {
    expect(hasFeature("free", "csvExport")).toBe(false);
  });

  test("QR limit is correct for each plan", () => {
    expect(getFeatureLimit("free", "qrCodesIncluded")).toBe(5);
    expect(getFeatureLimit("starter", "qrCodesIncluded")).toBe(25);
    expect(getFeatureLimit("pro", "qrCodesIncluded")).toBe(100);
    expect(getFeatureLimit("business", "qrCodesIncluded")).toBe(500);
  });
});
```

## Best Practices

1. **Always check features on both server and client** - Server for security, client for UX
2. **Use `tryCheckAccess()` in public-facing code** - Don't throw errors to users
3. **Provide clear upgrade paths** - Use `useUpgradePath()` to show which plan to upgrade to
4. **Display usage limits** - Use `FeatureLimitProgress` to show users how much they've used
5. **Batch feature checks** - Use `useMultipleFeatures()` when checking multiple features
6. **Keep error messages helpful** - Include what plan is needed and link to pricing

## Scalability Notes

- **Adding features**: Just add to `PlanFeatureSet` and `PLAN_CONFIG`
- **Dynamic plans**: Can be extended with database-driven plan configs by creating a wrapper around `PLAN_CONFIG`
- **Feature flags**: Can integrate with feature flag services by creating a middleware layer
- **A/B testing**: Can add experiment logic to `hasFeature()` without changing client code
- **Regional pricing**: Can be added to the plan configuration without changing the access control logic

## Migration Guide

If you have existing feature checks scattered throughout your code:

1. Replace all `userDoc.plan === "pro"` checks with `hasFeature(userDoc.plan, "featureName")`
2. Move all feature definitions to `PLAN_CONFIG`
3. Replace all `if (plan !== "free")` with proper feature checks
4. Update all UI hard-coded premium badges with `<FeatureBadge />` components

This centralizes all plan logic in one place, making it easier to maintain and extend.
