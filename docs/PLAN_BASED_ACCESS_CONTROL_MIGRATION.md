# Migration Guide: Converting Existing Feature Checks

If you have feature checks scattered throughout your codebase, use this guide to centralize them.

## Before & After Examples

### ❌ OLD: Scattered Plan Checks

```typescript
// Old way - scattered throughout codebase
if (userDoc.plan === "pro" || userDoc.plan === "business") {
  // show CSV export button
}

if (plan !== "free") {
  // enable analytics
}

const qrLimit = plan === "free" ? 5 : plan === "starter" ? 25 : plan === "pro" ? 100 : 500;

if (userDoc.plan === "business") {
  // show SSO settings
}
```

### ✅ NEW: Centralized Feature Checks

```typescript
// New way - centralized and type-safe
import { hasFeature, getFeatureLimit } from "@/lib/plans";

if (hasFeature(userDoc.plan, "csvExport")) {
  // show CSV export button
}

if (hasFeature(userDoc.plan, "scanAnalytics")) {
  // enable analytics
}

const qrLimit = getFeatureLimit(userDoc.plan, "qrCodesIncluded");

if (hasFeature(userDoc.plan, "ssoSAML")) {
  // show SSO settings
}
```

---

## Migration Checklist

### Phase 1: Server-Side (API Routes)

#### 1. Find all `plan ===` checks
```bash
grep -r "plan ===" app/api --include="*.ts"
grep -r "plan !==" app/api --include="*.ts"
```

#### 2. Replace with feature checks
```typescript
// Before
if (userDoc.plan === "pro" || userDoc.plan === "business") {
  // process CSV export
}

// After
import { requireFeature } from "@/lib/plans";
try {
  requireFeature(userDoc.plan, "csvExport");
  // process CSV export
} catch (err) {
  return createFeatureNotAvailableResponse(userDoc.plan, "csvExport");
}
```

#### 3. Move hard-coded limits to plan config
```typescript
// Before
const ANALYTICS_RETENTION_DAYS = {
  free: 0,
  starter: 30,
  pro: 60,
  business: 180,
}[userDoc.plan];

// After
const ANALYTICS_RETENTION_DAYS = getFeatureLimit(userDoc.plan, "scanAnalytics");
```

### Phase 2: Client-Side (React Components)

#### 1. Find feature checks in components
```bash
grep -r "plan ===" components --include="*.tsx"
grep -r "user?.plan" components --include="*.tsx"
```

#### 2. Convert to usePlanFeatures hook
```typescript
// Before
"use client";
import { useUserStore } from "@/stores/useUserStore";

export function MyComponent() {
  const { user } = useUserStore();
  
  if (user?.plan !== "pro" && user?.plan !== "business") {
    return <PremiumFeature />;
  }

  return <MyFeature />;
}

// After
"use client";
import { usePlanFeatures } from "@/hooks/usePlanFeatures";

export function MyComponent() {
  const { hasFeature } = usePlanFeatures();
  
  if (!hasFeature("myFeatureName")) {
    return <UpgradePrompt feature="myFeatureName" />;
  }

  return <MyFeature />;
}
```

#### 3. Replace hard-coded UI gates with FeatureGate components
```typescript
// Before
const hasAnalytics = user?.plan !== "free";

return (
  <>
    {hasAnalytics && (
      <div className="analytics-panel">
        <Chart />
      </div>
    )}
  </>
);

// After
import { FeatureGate, UpgradePrompt } from "@/components/FeatureGate";

return (
  <FeatureGate feature="scanAnalytics">
    <div className="analytics-panel">
      <Chart />
    </div>
    <UpgradePrompt slot="fallback" feature="scanAnalytics" />
  </FeatureGate>
);
```

---

## Specific Cases

### Case 1: Feature-Specific Limits

**Before:**
```typescript
// Spread throughout codebase
if (plan === "free") {
  maxQRs = 5;
} else if (plan === "starter") {
  maxQRs = 25;
} else if (plan === "pro") {
  maxQRs = 100;
} else {
  maxQRs = 500;
}
```

**After:**
```typescript
import { getFeatureLimit } from "@/lib/plans";

const maxQRs = getFeatureLimit(userPlan, "qrCodesIncluded");
```

### Case 2: Conditional Features

**Before:**
```typescript
// Show/hide buttons based on plan
return (
  <>
    {plan !== "free" && <PremiumButton />}
    {(plan === "pro" || plan === "business") && <AdvancedButton />}
    {plan === "business" && <EnterpriseButton />}
  </>
);
```

**After:**
```typescript
import { usePlanFeatures } from "@/hooks/usePlanFeatures";
import { FeatureGate } from "@/components/FeatureGate";

const { hasFeature } = usePlanFeatures();

return (
  <>
    <FeatureGate feature="someFeature">
      <PremiumButton />
    </FeatureGate>
    <FeatureGate feature="advancedFeature">
      <AdvancedButton />
    </FeatureGate>
    <FeatureGate feature="enterpriseFeature">
      <EnterpriseButton />
    </FeatureGate>
  </>
);
```

### Case 3: Nested Plan Checks

**Before:**
```typescript
if (userDoc.plan === "pro" || userDoc.plan === "business") {
  if (userDoc.plan === "business") {
    // Show enterprise-only features
  } else {
    // Show pro-only features
  }
}
```

**After:**
```typescript
import { hasFeature } from "@/lib/plans";

if (hasFeature(userDoc.plan, "myProFeature")) {
  if (hasFeature(userDoc.plan, "myEnterpriseFeature")) {
    // Show enterprise-only features
  } else {
    // Show pro-only features
  }
}
```

### Case 4: Dynamic Feature Lists

**Before:**
```typescript
const features = [];
if (plan !== "free") features.push("Custom Colors");
if (plan === "pro" || plan === "business") features.push("CSV Export");
if (plan === "business") features.push("SSO");
```

**After:**
```typescript
import { usePlanComparison } from "@/hooks/usePlanFeatures";

const { available } = usePlanComparison();
const featureNames = available.map(f => f.name);
```

---

## File-by-File Migration Order

1. **lib/db/users.ts** - User queries
2. **lib/db/qrs.ts** - QR operations
3. **app/api/qrs/route.ts** - QR API
4. **app/api/analytics/** - Analytics routes
5. **app/api/export/** - Export routes
6. **components/dashboard/** - Dashboard components
7. **app/dashboard/my-qrs/** - QR list page
8. **app/dashboard/create/** - QR creation
9. **app/dashboard/analytics/** - Analytics page
10. **components/PricingContent.tsx** - Pricing display

---

## Automated Migration Script (Optional)

If you want to automate some replacements:

```bash
#!/bin/bash

# Replace common plan checks
find . -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's/plan === "pro" || plan === "business"/hasFeature(plan, "featureName")/g'

find . -name "*.ts" -o -name "*.tsx" | xargs sed -i \
  's/plan !== "free"/hasFeature(plan, "featureName")/g'
```

**⚠️ Warning**: Use these with caution and review each change!

---

## Testing Your Migration

### Unit Tests

```typescript
import { hasFeature } from "@/lib/plans";

describe("Feature Migration", () => {
  test("All existing plan checks are replaced", () => {
    // Your component should use hasFeature now
  });

  test("Feature availability matches old plan checks", () => {
    // Pro plan features match old (plan === "pro" || plan === "business")
    expect(hasFeature("pro", "csvExport")).toBe(true);
  });
});
```

### Integration Tests

```typescript
test("API rejects feature not in plan", async () => {
  const response = await POST("/api/export", {
    // Free plan making request
  });
  
  expect(response.status).toBe(403);
  expect(response.json().code).toBe("FEATURE_NOT_AVAILABLE");
});
```

---

## Validation Checklist

- [ ] All `plan ===` comparisons replaced
- [ ] All hard-coded limits moved to PLAN_CONFIG
- [ ] All UI conditionals use `<FeatureGate>`
- [ ] All API routes use `checkAccess()` or `requireFeature()`
- [ ] Error handling uses standard response functions
- [ ] Tests updated to use new system
- [ ] No TypeScript errors
- [ ] Feature availability matches previous behavior

---

## Rollback Plan

If you need to rollback:

1. Git revert the changes: `git revert <commit>`
2. Keep the new system files for future use
3. Features remain backward compatible

---

## Common Issues & Solutions

### Issue: "Type 'xyz' is not assignable to parameter of type 'keyof PlanFeatureSet'"

**Solution**: Make sure you've added the feature to both the interface and PLAN_CONFIG in `lib/plans/plan-features.ts`

### Issue: Feature check always returns false

**Solution**: Verify the feature is enabled in `PLAN_CONFIG` for that plan

### Issue: "Cannot find module '@/lib/plans'"

**Solution**: Create the files following the file structure guide in the main documentation

---

## Performance Considerations

The new system is designed for performance:

- ✅ `hasFeature()` is O(1) lookup
- ✅ `getFeatureLimit()` is O(1) lookup
- ✅ React hooks use `useMemo()` to prevent re-renders
- ✅ No database queries for plan info (user plan cached in memory)

---

## Support

Need help migrating? Check:

1. [PLAN_BASED_ACCESS_CONTROL_QUICKSTART.md](./PLAN_BASED_ACCESS_CONTROL_QUICKSTART.md) - Quick reference
2. [PLAN_BASED_ACCESS_CONTROL.md](./PLAN_BASED_ACCESS_CONTROL.md) - Complete API
3. [PLAN_BASED_ACCESS_CONTROL_EXAMPLES.md](./PLAN_BASED_ACCESS_CONTROL_EXAMPLES.md) - Code patterns

All functions have clear TypeScript signatures that will help with autocomplete in your IDE.
