/**
 * INTEGRATION EXAMPLE: My QRs Page with Plan-Based Access Control
 * 
 * This file shows how to integrate the plan-based access control system
 * into the existing my-qrs page to show usage limits and upgrade prompts.
 * 
 * Location: app/dashboard/my-qrs/page.tsx
 */

// Add these imports to the existing file:
import {
  usePlanFeatures,
  useFeatureWithLimit,
} from "@/hooks/usePlanFeatures";
import {
  FeatureLimitProgress,
  UpgradePrompt,
  FeatureGate,
} from "@/components/FeatureGate";

// After the existing component, add these sections:

/**
 * Component: QRUsageSummary
 * Shows the user's QR usage against their plan limit
 */
function QRUsageSummary({ total }: { total: number }) {
  const qrLimitInfo = useFeatureWithLimit("qrCodesIncluded", total);

  if (!qrLimitInfo.available) {
    return <UpgradePrompt feature="qrCodesIncluded" />;
  }

  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-4">
      <FeatureLimitProgress feature="qrCodesIncluded" current={total} />

      {qrLimitInfo.remainingCount !== null && (
        <div className="mt-3 text-sm text-zinc-400">
          {qrLimitInfo.remainingCount === 0 ? (
            <>
              <p className="font-medium text-amber-500">
                You've reached your QR code limit
              </p>
              <a
                href="/dashboard/pricing"
                className="mt-1 inline-block text-emerald-500 hover:text-emerald-400"
              >
                Upgrade your plan to create more →
              </a>
            </>
          ) : (
            <p>
              {qrLimitInfo.remainingCount} QR code{qrLimitInfo.remainingCount !== 1 ? "s" : ""} remaining
            </p>
          )}
        </div>
      )}
    </div>
  );
}

/**
 * Component: AnalyticsFeatureGate
 * Shows analytics features only if available in plan
 */
function AnalyticsFeatureGate({ children }: { children: React.ReactNode }) {
  return (
    <FeatureGate feature="scanAnalytics" showUpgradeButton={false}>
      {children}
    </FeatureGate>
  );
}

/**
 * Component: QRActionButtons
 * Shows available actions based on plan
 */
function QRActionButtons({ qrId }: { qrId: string }) {
  const { hasFeature } = usePlanFeatures();

  return (
    <div className="flex gap-2">
      <Link href={`/dashboard/my-qrs/${qrId}`} className="btn btn-sm">
        <Eye className="size-4" />
        View
      </Link>

      <FeatureGate
        feature="geoFencedQR"
        fallback={
          <button
            className="btn btn-sm"
            title="Geo-fencing requires Pro plan"
            disabled
          >
            Geo-Fence
          </button>
        }
      >
        <button className="btn btn-sm">Geo-Fence</button>
      </FeatureGate>

      {hasFeature("expiringQR") && (
        <button className="btn btn-sm">Expiring</button>
      )}
    </div>
  );
}

/**
 * UPDATED: MyQRsPage component
 * Integrate plan features into the existing page
 */
export default function MyQRsPageUpdated() {
  // ... existing state and effects ...

  const { plan, hasFeature, getLimit } = usePlanFeatures();
  const qrLimit = useFeatureWithLimit("qrCodesIncluded", total);

  return (
    <>
      <DashboardHeader />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Title row */}
          <div className="flex flex-col gap-1">
            <h1 className="text-2xl font-bold text-white">My QR Codes</h1>
            <p className="text-sm text-zinc-400">Manage your QR codes</p>
          </div>

          {/* NEW: Usage Summary */}
          {!loading && total > 0 && (
            <div className="mt-6">
              <QRUsageSummary total={total} />
            </div>
          )}

          {/* Controls */}
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-zinc-500" />
              <div className="flex gap-1">
                <button
                  onClick={() => setView("grid")}
                  className={cn(
                    "rounded p-2 transition-colors",
                    view === "grid"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white"
                  )}
                  title="Grid view"
                >
                  <Grid2X2 className="size-4" />
                </button>
                <button
                  onClick={() => setView("list")}
                  className={cn(
                    "rounded p-2 transition-colors",
                    view === "list"
                      ? "bg-zinc-800 text-white"
                      : "text-zinc-400 hover:text-white"
                  )}
                  title="List view"
                >
                  <List className="size-4" />
                </button>
              </div>
            </div>

            {/* NEW: Create Button with Plan Gate */}
            <FeatureGate feature="qrCodesIncluded">
              <Link
                href="/dashboard/create"
                className="inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="size-4" />
                Create QR Code
              </Link>

              {/* Show when limit is reached */}
              {qrLimit.currentValue !== undefined &&
                qrLimit.limit !== undefined &&
                qrLimit.currentValue >= qrLimit.limit && (
                  <div className="text-sm text-amber-500">
                    Limit reached. {" "}
                    <a href="/dashboard/pricing" className="underline hover:no-underline">
                      Upgrade
                    </a>
                  </div>
                )}
            </FeatureGate>
          </div>

          {/* NEW: Empty state with upgrade prompt */}
          {!loading && total === 0 && (
            <div className="mt-12 flex flex-col items-center justify-center rounded-lg border border-dashed border-zinc-700 bg-zinc-900/30 px-6 py-12 text-center">
              <QrCode className="mb-4 size-12 text-zinc-600" />
              <h2 className="text-lg font-semibold text-white">
                No QR codes yet
              </h2>
              <p className="mt-2 text-sm text-zinc-400">
                {plan === "free"
                  ? "Free plan includes 5 QR codes."
                  : `Your ${plan} plan includes ${getLimit("qrCodesIncluded")} QR codes.`}
              </p>
              <Link
                href="/dashboard/create"
                className="mt-4 inline-flex items-center gap-2 rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <Plus className="size-4" />
                Create your first QR
              </Link>
              {plan === "free" && (
                <p className="mt-4 text-xs text-zinc-500">
                  <Link
                    href="/dashboard/pricing"
                    className="text-emerald-500 transition-colors hover:text-emerald-400"
                  >
                    See all plans
                  </Link>
                </p>
              )}
            </div>
          )}

          {/* QR List/Grid */}
          {loading && (
            <div className={cn(
              "mt-6 gap-4",
              view === "grid"
                ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                : "space-y-3"
            )}>
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-64" />
              ))}
            </div>
          )}

          {!loading && qrs.length > 0 && (
            <div
              className={cn(
                "mt-6 gap-4",
                view === "grid"
                  ? "grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
                  : "space-y-3"
              )}
            >
              {qrs.map((qr) => (
                <div
                  key={qr.id}
                  className="group rounded-lg border border-zinc-800 bg-zinc-900 p-4 transition-all hover:border-zinc-700"
                >
                  <div className="mb-3 flex items-start justify-between">
                    <h3 className="font-medium text-white truncate">
                      {qr.name}
                    </h3>
                    <span
                      className={cn(
                        "inline-block rounded-full px-2 py-1 text-xs font-medium",
                        qr.status === "active"
                          ? "bg-emerald-500/10 text-emerald-400"
                          : "bg-zinc-800 text-zinc-400"
                      )}
                    >
                      {qr.status}
                    </span>
                  </div>

                  <div className="mb-3 text-sm text-zinc-400">
                    {formatContentType(qr.contentType)}
                  </div>

                  {/* NEW: Analytics feature gate */}
                  <AnalyticsFeatureGate>
                    <div className="mb-3 text-sm text-zinc-500">
                      <strong className="text-zinc-300">
                        {qr.scanCount}
                      </strong>{" "}
                      scans
                    </div>
                  </AnalyticsFeatureGate>

                  <div className="mb-4 text-xs text-zinc-500">
                    {formatDate(qr.createdAt)}
                  </div>

                  {/* NEW: Plan-aware actions */}
                  <QRActionButtons qrId={qr.id} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}

/**
 * SUMMARY OF CHANGES:
 * 
 * 1. Added plan-aware usage display with FeatureLimitProgress
 * 2. Gated the "Create QR" button - shows limit warning when reached
 * 3. Improved empty state to show plan limits
 * 4. Added plan-aware action buttons (Geo-Fence, Expiring, etc.)
 * 5. Gated scan analytics display based on scanAnalytics feature
 * 6. Shows relevant upgrade prompts when features aren't available
 * 
 * FUTURE ENHANCEMENTS:
 * - Add analytics retention label based on plan (30/60/180 days)
 * - Show feature badges on QR cards for premium features
 * - Add batch action buttons (only for plans that support teams)
 * - Show team collaboration features based on plan
 */
