/**
 * Smart Modal Component for Plan Restrictions
 * Automatically handles backend responses for plan-based access control
 * 
 * Usage:
 * ```tsx
 * const [modalState, setModalState] = useState<PlanRestrictionState | null>(null);
 * 
 * try {
 *   await api.createQR(data);
 * } catch (err) {
 *   setModalState(parsePlanRestrictionError(err));
 * }
 * 
 * <PlanRestrictionModal 
 *   state={modalState} 
 *   onClose={() => setModalState(null)} 
 * />
 * ```
 */

"use client";

import { useRouter } from "next/navigation";
import { X, Lock, AlertTriangle, Zap, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import type { PlanSlug } from "@/lib/db/schemas/user";

/**
 * Error response structure from backend
 */
export interface PlanRestrictionError {
  error: string;
  code: "FEATURE_NOT_AVAILABLE" | "LIMIT_EXCEEDED" | "GENERIC_ERROR";
  feature?: string;
  currentPlan?: PlanSlug;
  upgradeTo?: PlanSlug;
  limit?: string | number;
  currentValue?: number;
  details?: {
    available?: boolean;
    limit?: string | number;
    requiredPlan?: PlanSlug;
  };
}

/**
 * Modal state
 */
export interface PlanRestrictionState {
  type: "feature_locked" | "limit_exceeded" | "error";
  title: string;
  message: string;
  featureName?: string;
  currentPlan?: PlanSlug;
  upgradePlan?: PlanSlug;
  upgradePlanName?: string;
  upgradePlanPrice?: string;
  limit?: string | number;
  currentValue?: number;
  showUpgradeButton?: boolean;
}

/**
 * Parse backend error to modal state
 */
export function parsePlanRestrictionError(error: any): PlanRestrictionState | null {
  // Check if it's an axios error with response data
  const data: PlanRestrictionError | undefined = error?.response?.data;
  
  if (!data) {
    return null;
  }

  // Handle feature not available
  if (data.code === "FEATURE_NOT_AVAILABLE") {
    const planNames: Record<PlanSlug, string> = {
      free: "Free",
      starter: "Starter",
      pro: "Pro",
      business: "Business",
    };
    
    const planPrices: Record<PlanSlug, string> = {
      free: "Free",
      starter: "$4.99/month",
      pro: "$11.99/month",
      business: "$29.99/month",
    };

    const featureName = data.feature ? formatFeatureName(data.feature) : "This feature";
    const currentPlanName = data.currentPlan ? planNames[data.currentPlan] : "your current";
    const upgradePlanName = data.upgradeTo ? planNames[data.upgradeTo] : "a higher";
    const upgradePlanPrice = data.upgradeTo ? planPrices[data.upgradeTo] : "";

    return {
      type: "feature_locked",
      title: "Feature Not Available",
      message: `${featureName} is not available in your ${currentPlanName} plan. Upgrade to ${upgradePlanName} to unlock this feature.`,
      featureName,
      currentPlan: data.currentPlan,
      upgradePlan: data.upgradeTo,
      upgradePlanName,
      upgradePlanPrice,
      showUpgradeButton: true,
    };
  }

  // Handle limit exceeded
  if (data.code === "LIMIT_EXCEEDED") {
    const featureName = data.feature ? formatFeatureName(data.feature) : "usage";
    
    return {
      type: "limit_exceeded",
      title: "Limit Reached",
      message: `You've reached your ${featureName} limit of ${data.limit}. Upgrade your plan to get higher limits.`,
      featureName,
      currentPlan: data.currentPlan,
      limit: data.limit,
      currentValue: data.currentValue,
      showUpgradeButton: true,
    };
  }

  // Generic error
  return {
    type: "error",
    title: "Action Failed",
    message: data.error || "Something went wrong. Please try again.",
    showUpgradeButton: false,
  };
}

/**
 * Format feature key to readable name
 */
function formatFeatureName(feature: string): string {
  const names: Record<string, string> = {
    qrCodesIncluded: "QR Codes",
    imagesAndVideo: "Images & Video",
    getFoundQR: "Get Found QR",
    contactVCard: "Contact (vCard)",
    customColorsAndLogo: "Custom Colors & Logo",
    removeUseQRBranding: "Remove Branding",
    smartRedirectDevice: "Smart Redirect",
    expiringQR: "Expiring QR",
    scanAnalytics: "Scan Analytics",
    csvExport: "CSV Export",
    geoFencedQR: "Geo-fenced QR",
    prioritySupport: "Priority Support",
    teamMembers: "Team Members",
    ssoSAML: "SSO (SAML)",
    dedicatedSupport: "Dedicated Support",
  };

  return names[feature] || feature;
}

/**
 * Main modal component
 */
export function PlanRestrictionModal({
  state,
  onClose,
  onUpgrade,
}: {
  state: PlanRestrictionState | null;
  onClose: () => void;
  onUpgrade?: () => void;
}) {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (state) {
      setIsVisible(true);
    }
  }, [state]);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Wait for animation
  };

  const handleUpgrade = () => {
    handleClose();
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/dashboard/pricing");
    }
  };

  if (!state) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-50 bg-black/60 backdrop-blur-sm transition-opacity duration-300 ${
          isVisible ? "opacity-100" : "opacity-0"
        }`}
        onClick={handleClose}
      />

      {/* Modal */}
      <div
        className={`fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 transition-all duration-300 ${
          isVisible
            ? "-translate-y-1/2 scale-100 opacity-100"
            : "-translate-y-1/2 scale-95 opacity-0"
        }`}
      >
        <div className="relative mx-4 rounded-xl border border-white/10 bg-zinc-900 shadow-2xl">
          {/* Close button */}
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-lg p-1 text-zinc-400 transition-colors hover:bg-white/5 hover:text-white"
            aria-label="Close"
          >
            <X className="size-5" />
          </button>

          {/* Icon */}
          <div className="flex justify-center pt-6">
            {state.type === "feature_locked" && (
              <div className="flex size-12 items-center justify-center rounded-full bg-amber-500/10">
                <Lock className="size-6 text-amber-500" />
              </div>
            )}
            {state.type === "limit_exceeded" && (
              <div className="flex size-12 items-center justify-center rounded-full bg-red-500/10">
                <AlertTriangle className="size-6 text-red-500" />
              </div>
            )}
            {state.type === "error" && (
              <div className="flex size-12 items-center justify-center rounded-full bg-zinc-500/10">
                <AlertTriangle className="size-6 text-zinc-500" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="px-6 pb-6 pt-4">
            <h2 className="text-center text-xl font-semibold text-white">
              {state.title}
            </h2>
            {state.type === "feature_locked" && state.featureName ? (
              <p className="mt-2 text-center text-sm text-zinc-400">
                <span className="font-semibold text-white/70">{state.featureName}</span> is not available in your {state.currentPlan ? state.currentPlan.charAt(0).toUpperCase() + state.currentPlan.slice(1) : "current"} plan. Upgrade to {state.upgradePlanName} to unlock this feature.
              </p>
            ) : (
              <p className="mt-2 text-center text-sm text-zinc-400">
                {state.message}
              </p>
            )}

            {/* Limit details */}
            {state.type === "limit_exceeded" && state.limit && state.currentValue !== undefined && (
              <div className="mt-4 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-zinc-400">Current usage</span>
                  <span className="font-medium text-white">
                    {state.currentValue} / {state.limit}
                  </span>
                </div>
                <div className="mt-2 h-2 overflow-hidden rounded-full bg-zinc-800">
                  <div
                    className="h-full bg-red-500"
                    style={{
                      width: `${Math.min(
                        ((state.currentValue || 0) / Number(state.limit)) * 100,
                        100
                      )}%`,
                    }}
                  />
                </div>
              </div>
            )}

            {/* Upgrade info - Enhanced Premium Design */}
            {state.showUpgradeButton && state.upgradePlanName && (
              <div className="mt-6">
                {/* Divider with gradient */}
                <div className="relative mb-4 flex items-center">
                  <div className="flex-1 border-t border-white/5"></div>
                  <div className="px-3">
                    <TrendingUp className="size-4 text-emerald-500 animate-pulse" />
                  </div>
                  <div className="flex-1 border-t border-white/5"></div>
                </div>

                {/* Premium upgrade card */}
                <div className="group relative overflow-hidden rounded-xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/10 via-emerald-500/5 to-transparent p-[1px] transition-all hover:border-emerald-500/50 hover:shadow-lg hover:shadow-emerald-500/20">
                  {/* Animated gradient background */}
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 opacity-0 transition-opacity duration-500 group-hover:opacity-100" 
                       style={{ animation: 'shimmer 2s infinite' }} />
                  
                  <div className="relative rounded-xl bg-zinc-900/90 p-4 backdrop-blur-sm">
                    {/* Header with icon */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 shadow-lg shadow-emerald-500/25">
                        <Zap className="size-5 text-white" fill="white" />
                      </div>
                      <div>
                        <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                          Unlock with
                        </p>
                        <p className="text-lg font-bold text-white">
                          {state.upgradePlanName} Plan
                        </p>
                      </div>
                    </div>

                    {/* Price with emphasis */}
                    {state.upgradePlanPrice && (
                      <div className="mb-3 flex items-baseline gap-2 border-t border-white/5 pt-3">
                        <span className="text-3xl font-bold text-white">
                          {state.upgradePlanPrice.split('/')[0]}
                        </span>
                        <span className="text-sm text-zinc-400">
                          /{state.upgradePlanPrice.split('/')[1] || 'month'}
                        </span>
                        <div className="ml-auto rounded-full bg-emerald-500/20 px-2.5 py-1 text-xs font-semibold text-emerald-400">
                          Best Value
                        </div>
                      </div>
                    )}

                    {/* Feature highlight */}
                    <div className="space-y-2 rounded-lg bg-white/[0.02] p-3 border border-white/5">
                      <p className="text-xs font-medium text-zinc-400">
                        ✨ What you'll get:
                      </p>
                      <ul className="space-y-1.5 text-sm text-zinc-300">
                        <li className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                          <span>{state.featureName || "This feature"}</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                          <span>Advanced analytics & insights</span>
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="size-1.5 rounded-full bg-emerald-500" />
                          <span>Priority customer support</span>
                        </li>
                      </ul>
                    </div>

                    {/* Subtle animation hint */}
                    <div className="mt-3 text-center">
                      <p className="text-xs text-zinc-500">
                        Join <span className="font-semibold text-emerald-400">1,000+</span> users on {state.upgradePlanName}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Actions - Enhanced CTAs */}
            <div className="mt-6 flex flex-col-reverse sm:flex-row gap-3">
              <button
                onClick={handleClose}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-zinc-300 transition-all hover:bg-white/10 hover:text-white hover:border-white/20"
              >
                Maybe Later
              </button>
              {state.showUpgradeButton && (
                <button
                  onClick={handleUpgrade}
                  className="group relative flex flex-1 items-center justify-center gap-2 overflow-hidden rounded-lg bg-gradient-to-r from-emerald-600 to-emerald-500 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-emerald-500/25 transition-all hover:shadow-xl hover:shadow-emerald-500/40 hover:scale-[1.02] active:scale-[0.98]"
                >
                  {/* Shimmer effect */}
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/20 to-transparent transition-transform duration-1000 group-hover:translate-x-full" />
                  
                  <Zap className="size-4 relative z-10" fill="white" />
                  <span className="relative z-10">Upgrade Now</span>
                </button>
              )}
            </div>

            {/* Trust indicators */}
            {state.showUpgradeButton && (
              <div className="mt-4 flex items-center justify-center gap-4 text-xs text-zinc-500">
                <span className="flex items-center gap-1">
                  ✓ Cancel anytime
                </span>
                <span className="text-zinc-700">•</span>
                <span className="flex items-center gap-1">
                  ✓ Instant access
                </span>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

/**
 * Hook for managing plan restriction modal
 */
export function usePlanRestrictionModal() {
  const [modalState, setModalState] = useState<PlanRestrictionState | null>(null);

  const handleError = (error: any) => {
    const state = parsePlanRestrictionError(error);
    if (state) {
      setModalState(state);
      return true; // Handled
    }
    return false; // Not a plan restriction error
  };

  const closeModal = () => {
    setModalState(null);
  };

  return {
    modalState,
    setModalState,
    handleError,
    closeModal,
  };
}

/**
 * Inline component for displaying restriction info (non-modal)
 */
export function PlanRestrictionBanner({
  state,
  onClose,
  onUpgrade,
}: {
  state: PlanRestrictionState;
  onClose?: () => void;
  onUpgrade?: () => void;
}) {
  const router = useRouter();

  const handleUpgrade = () => {
    if (onUpgrade) {
      onUpgrade();
    } else {
      router.push("/dashboard/pricing");
    }
  };

  const bgColor =
    state.type === "feature_locked"
      ? "bg-amber-500/10 border-amber-500/20"
      : state.type === "limit_exceeded"
        ? "bg-red-500/10 border-red-500/20"
        : "bg-zinc-500/10 border-zinc-500/20";

  const iconColor =
    state.type === "feature_locked"
      ? "text-amber-500"
      : state.type === "limit_exceeded"
        ? "text-red-500"
        : "text-zinc-500";

  return (
    <div className={`rounded-lg border ${bgColor} p-4`}>
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          {state.type === "feature_locked" && <Lock className={`size-5 ${iconColor}`} />}
          {state.type === "limit_exceeded" && <AlertTriangle className={`size-5 ${iconColor}`} />}
          {state.type === "error" && <AlertTriangle className={`size-5 ${iconColor}`} />}
        </div>

        <div className="flex-1">
          <h3 className="font-semibold text-white">{state.title}</h3>
          <p className="mt-1 text-sm text-zinc-400">{state.message}</p>

          {state.showUpgradeButton && (
            <button
              onClick={handleUpgrade}
              className="mt-3 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-400 hover:text-emerald-300"
            >
              <TrendingUp className="size-4" />
              Upgrade to {state.upgradePlanName || "unlock"}
            </button>
          )}
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="flex-shrink-0 text-zinc-500 hover:text-zinc-400"
          >
            <X className="size-5" />
          </button>
        )}
      </div>
    </div>
  );
}
