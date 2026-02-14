# Quick Start Guide - Plan-Based Access Control

Get up and running with the plan-based access control system in 5 minutes.

## TL;DR

### For Developers
1. Import utilities: `import { hasFeature, checkAccess } from "@/lib/plans"`
2. Check features in code: `if (hasFeature(userPlan, "csvExport")) { ... }`
3. Use React hooks: `const { hasFeature } = usePlanFeatures()`
4. Wrap UI: `<FeatureGate feature="csvExport"><MyComponent /></FeatureGate>`

### To Add a New Feature
1. Add to `lib/plans/plan-features.ts` interface
2. Add to `PLAN_CONFIG` object
3. Start using it everywhere!

---

## Common Tasks

### Check if Feature is Available (Server-Side)

```typescript
import { hasFeature, requireFeature } from "@/lib/plans";

// Soft check - returns boolean
if (hasFeature(userDoc.plan, "csvExport")) {
  // Feature is available
}

// Strict check - throws error if unavailable
try {
  requireFeature(userDoc.plan, "csvExport");
} catch (err) {
  // Handle feature not available
}
```

### Check Feature and Limits

```typescript
import { checkAccess, tryCheckAccess } from "@/lib/plans";

// Strict (throws)
try {
  checkAccess({ plan: userDoc.plan }, "qrCodesIncluded", currentQRCount);
} catch (err) {
  return res.status(403).json({ error: "Limit exceeded" });
}

// Safe (returns object)
const result = tryCheckAccess({ plan: userDoc.plan }, "qrCodesIncluded", 10);
if (!result.allowed) {
  console.log(`Can upgrade to ${result.upgradeTo}`);
}
```

### Check in React Components

```typescript
import { usePlanFeatures } from "@/hooks/usePlanFeatures";

export function MyComponent() {
  const { hasFeature, getLimit } = usePlanFeatures();

  if (!hasFeature("csvExport")) {
    return <UpgradePrompt feature="csvExport" />;
  }

  return <ExportButton />;
}
```

### Show Usage Limits

```typescript
import { useFeatureWithLimit } from "@/hooks/usePlanFeatures";
import { FeatureLimitProgress } from "@/components/FeatureGate";

export function QRInfo({ qrCount }: { qrCount: number }) {
  const { available, limit, percentageUsed } = useFeatureWithLimit("qrCodesIncluded", qrCount);

  return (
    <>
      <FeatureLimitProgress feature="qrCodesIncluded" current={qrCount} />
      <p>{percentageUsed}% used</p>
    </>
  );
}
```

### Protect API Routes

```typescript
import { checkAccess } from "@/lib/plans";
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
  }

  // Process request...
}
```

### Gate UI Components

```typescript
import { FeatureGate, UpgradePrompt } from "@/components/FeatureGate";

export function Dashboard() {
  return (
    <div>
      <FeatureGate feature="csvExport">
        <ExportButton />
      </FeatureGate>

      <FeatureGate 
        feature="geoFencedQR"
        fallback={<LockedFeature />}
      >
        <GeoFenceControl />
      </FeatureGate>

      <UpgradePrompt 
        feature="ssoSAML" 
        title="SSO requires Business plan"
      />
    </div>
  );
}
```

---

## Feature List Reference

### Free Plan
- 5 QR codes
- Links & text
- Custom colors & logo
- Update content anytime
- High-res download
- 1 team member

### Starter Plan ($4.99/month)
- 25 QR codes
- Images & video
- Get Found QR
- vCard contact
- Remove branding
- Smart redirect (device)
- 30-day scan analytics
- 1 team member

### Pro Plan ($11.99/month)
- 100 QR codes
- All Starter features
- Expiring QR
- 60-day scan analytics
- CSV export
- Geo-fenced QR
- Priority support
- 4 team members

### Business Plan ($29.99/month)
- 500 QR codes
- All Pro features
- 180-day scan analytics
- SSO (SAML)
- Dedicated support
- 10 team members

---

## All Available Hook & Component Functions

### Hooks

```typescript
// Main hook
const { plan, hasFeature, getLimit, requiresUpgrade, canUpgradeTo } = usePlanFeatures();

// Specific feature
const { available, requiresUpgrade, info } = useFeatureAvailability("csvExport");

// With limits
const { available, limit, percentageUsed, remainingCount } = useFeatureWithLimit("qrCodesIncluded", 10);

// Plan comparison
const { available, unavailable, availableCount } = usePlanComparison();

// Multiple features
const { features, allAvailable, anyAvailable } = useMultipleFeatures(["csvExport", "geoFencedQR"]);

// Upgrade path
const { requiredPlan, requiredPlanName, requiredPlanPrice } = useUpgradePath("csvExport");
```

### Components

```typescript
// Conditional rendering
<FeatureGate feature="csvExport">
  <button>Export</button>
  <UpgradePrompt slot="fallback" feature="csvExport" />
</FeatureGate>

// Locked state
<FeatureLocked feature="geoFencedQR" />

// Usage progress
<FeatureLimitProgress feature="qrCodesIncluded" current={10} />

// Upgrade prompt
<UpgradePrompt feature="csvExport" />

// Badge
<FeatureBadge feature="csvExport" showPlan={true} />

// Button with gate
<FeatureGateButton feature="csvExport" onClick={export}>
  Export
</FeatureGateButton>
```

---

## File Locations

```
Core System:
  lib/plans/plan-features.ts      ← Feature definitions
  lib/plans/access-control.ts     ← Validation logic
  lib/plans/middleware.ts         ← API helpers
  lib/plans/index.ts              ← Export everything

React Integration:
  hooks/usePlanFeatures.ts        ← All hooks
  components/FeatureGate.tsx      ← All components

Documentation:
  docs/PLAN_BASED_ACCESS_CONTROL.md           ← Full guide
  docs/PLAN_BASED_ACCESS_CONTROL_EXAMPLES.md  ← Code examples
  docs/INTEGRATION_EXAMPLE_MY_QRS.md           ← Real integration
```

---

## Common Error Handling

```typescript
import { 
  FeatureNotAvailableError, 
  LimitExceededError 
} from "@/lib/plans";

try {
  checkAccess({ plan: userDoc.plan }, "csvExport", currentUsage);
} catch (err) {
  if (err instanceof FeatureNotAvailableError) {
    // Feature not available in this plan
    const upgrade = getUpgradePath(userDoc.plan, err.featureKey);
    return res.status(403).json({ 
      error: "Feature not available",
      upgradeTo: upgrade 
    });
  }
  
  if (err instanceof LimitExceededError) {
    // Usage limit exceeded
    return res.status(429).json({ 
      error: "Limit exceeded",
      limit: err.limit,
      current: err.currentValue
    });
  }
}
```

---

## Import Paths

```typescript
// Main imports
import { hasFeature, checkAccess } from "@/lib/plans";

// Detailed imports
import { 
  hasFeature, 
  getFeatureLimit, 
  getPlanFeatures 
} from "@/lib/plans/plan-features";

import { 
  checkAccess, 
  tryCheckAccess,
  FeatureNotAvailableError,
  LimitExceededError
} from "@/lib/plans/access-control";

import { 
  createFeatureNotAvailableResponse,
  createLimitExceededResponse
} from "@/lib/plans/middleware";

// Hooks
import { 
  usePlanFeatures,
  useFeatureAvailability,
  useFeatureWithLimit
} from "@/hooks/usePlanFeatures";

// Components
import { 
  FeatureGate,
  FeatureLocked,
  FeatureLimitProgress,
  UpgradePrompt
} from "@/components/FeatureGate";
```

---

## Testing Example

```typescript
import { hasFeature, checkAccess } from "@/lib/plans";

describe("Plan Features", () => {
  test("Pro has CSV export", () => {
    expect(hasFeature("pro", "csvExport")).toBe(true);
  });

  test("Free doesn't have CSV export", () => {
    expect(hasFeature("free", "csvExport")).toBe(false);
  });

  test("QR limit enforcement", () => {
    expect(() => {
      checkAccess({ plan: "free" }, "qrCodesIncluded", 10);
    }).toThrow(LimitExceededError);
  });
});
```

---

## Next Steps

1. Read [PLAN_BASED_ACCESS_CONTROL.md](./PLAN_BASED_ACCESS_CONTROL.md) for complete API
2. Check [PLAN_BASED_ACCESS_CONTROL_EXAMPLES.md](./PLAN_BASED_ACCESS_CONTROL_EXAMPLES.md) for patterns
3. Review [INTEGRATION_EXAMPLE_MY_QRS.md](./INTEGRATION_EXAMPLE_MY_QRS.md) for real example
4. Start integrating into your components!

---

**Need help?** All utilities are type-safe with good IDE autocomplete support.
