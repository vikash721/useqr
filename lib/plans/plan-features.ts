/**
 * Plan-based feature definitions
 * This is the single source of truth for all plan features and restrictions.
 * New features can be added by extending the Feature interface and updating plan configs.
 *
 * Design principles:
 * - Declarative: Features are defined once, reused everywhere
 * - Scalable: Adding new features requires minimal code changes
 * - Type-safe: Full TypeScript support for feature checking
 * - Backend-driven: Can be extended with dynamic plan configs from DB
 */

import type { PlanSlug } from "@/lib/db/schemas/user";

/**
 * Feature definition with limits and properties
 */
export interface Feature {
  id: string;
  name: string;
  description?: string;
  /** Whether the feature is available (null = unavailable) */
  available: boolean | null;
  /** Optional string limit (e.g., "30 days", "5 codes") */
  limit?: string | number;
  /** Enterprise/custom feature */
  enterprise?: boolean;
}

/**
 * Plan feature set
 */
export interface PlanFeatureSet {
  qrCodesIncluded: Feature;
  linksAndText: Feature;
  imagesAndVideo: Feature;
  getFoundQR: Feature;
  contactVCard: Feature;
  customColorsAndLogo: Feature;
  removeUseQRBranding: Feature;
  updateContentAnytime: Feature;
  smartRedirectDevice: Feature;
  expiringQR: Feature;
  scanAnalytics: Feature;
  csvExport: Feature;
  geoFencedQR: Feature;
  highResDownload: Feature;
  prioritySupport: Feature;
  teamMembers: Feature;
  ssoSAML: Feature;
  dedicatedSupport: Feature;
}

/**
 * All available plans
 */
export type Plan = PlanSlug;

/**
 * Complete plan configuration mapping
 * This is the master configuration for all plans and their features.
 * When adding new features:
 * 1. Add them to the Feature interface
 * 2. Add them to all plan configs below
 * 3. Use them in the app with getPlanFeature()
 */
export const PLAN_CONFIG: Record<Plan, PlanFeatureSet> = {
  free: {
    qrCodesIncluded: { id: "qr-codes", name: "QR Codes Included", available: true, limit: 5 },
    linksAndText: { id: "links-text", name: "Links & Text", available: true },
    imagesAndVideo: { id: "images-video", name: "Images & Video", available: false },
    getFoundQR: { id: "get-found-qr", name: "Get Found QR", available: false },
    contactVCard: { id: "contact-vcard", name: "Contact (vCard)", available: false },
    customColorsAndLogo: { id: "custom-colors", name: "Custom Colors & Logo", available: true },
    removeUseQRBranding: { id: "remove-branding", name: "Remove UseQR Branding", available: false },
    updateContentAnytime: { id: "update-content", name: "Update Content Anytime", available: true },
    smartRedirectDevice: { id: "smart-redirect", name: "Smart Redirect (Device)", available: false },
    expiringQR: { id: "expiring-qr", name: "Expiring QR", available: false },
    scanAnalytics: { id: "scan-analytics", name: "Scan Analytics", available: false },
    csvExport: { id: "csv-export", name: "CSV Export", available: false },
    geoFencedQR: { id: "geo-fenced-qr", name: "Geo-fenced QR", available: false },
    highResDownload: { id: "high-res-download", name: "High-res Download", available: true },
    prioritySupport: { id: "priority-support", name: "Priority Support", available: false },
    teamMembers: { id: "team-members", name: "Team Members", available: true, limit: 1 },
    ssoSAML: { id: "sso-saml", name: "SSO (SAML)", available: false },
    dedicatedSupport: { id: "dedicated-support", name: "Dedicated Support", available: false },
  },
  starter: {
    qrCodesIncluded: { id: "qr-codes", name: "QR Codes Included", available: true, limit: 25 },
    linksAndText: { id: "links-text", name: "Links & Text", available: true },
    imagesAndVideo: { id: "images-video", name: "Images & Video", available: true },
    getFoundQR: { id: "get-found-qr", name: "Get Found QR", available: true },
    contactVCard: { id: "contact-vcard", name: "Contact (vCard)", available: true },
    customColorsAndLogo: { id: "custom-colors", name: "Custom Colors & Logo", available: true },
    removeUseQRBranding: { id: "remove-branding", name: "Remove UseQR Branding", available: true },
    updateContentAnytime: { id: "update-content", name: "Update Content Anytime", available: true },
    smartRedirectDevice: { id: "smart-redirect", name: "Smart Redirect (Device)", available: true },
    expiringQR: { id: "expiring-qr", name: "Expiring QR", available: false },
    scanAnalytics: { id: "scan-analytics", name: "Scan Analytics", available: true, limit: "30 days" },
    csvExport: { id: "csv-export", name: "CSV Export", available: false },
    geoFencedQR: { id: "geo-fenced-qr", name: "Geo-fenced QR", available: false },
    highResDownload: { id: "high-res-download", name: "High-res Download", available: true },
    prioritySupport: { id: "priority-support", name: "Priority Support", available: false },
    teamMembers: { id: "team-members", name: "Team Members", available: true, limit: 1 },
    ssoSAML: { id: "sso-saml", name: "SSO (SAML)", available: false },
    dedicatedSupport: { id: "dedicated-support", name: "Dedicated Support", available: false },
  },
  pro: {
    qrCodesIncluded: { id: "qr-codes", name: "QR Codes Included", available: true, limit: 100 },
    linksAndText: { id: "links-text", name: "Links & Text", available: true },
    imagesAndVideo: { id: "images-video", name: "Images & Video", available: true },
    getFoundQR: { id: "get-found-qr", name: "Get Found QR", available: true },
    contactVCard: { id: "contact-vcard", name: "Contact (vCard)", available: true },
    customColorsAndLogo: { id: "custom-colors", name: "Custom Colors & Logo", available: true },
    removeUseQRBranding: { id: "remove-branding", name: "Remove UseQR Branding", available: true },
    updateContentAnytime: { id: "update-content", name: "Update Content Anytime", available: true },
    smartRedirectDevice: { id: "smart-redirect", name: "Smart Redirect (Device)", available: true },
    expiringQR: { id: "expiring-qr", name: "Expiring QR", available: true },
    scanAnalytics: { id: "scan-analytics", name: "Scan Analytics", available: true, limit: "60 days" },
    csvExport: { id: "csv-export", name: "CSV Export", available: true },
    geoFencedQR: { id: "geo-fenced-qr", name: "Geo-fenced QR", available: true },
    highResDownload: { id: "high-res-download", name: "High-res Download", available: true },
    prioritySupport: { id: "priority-support", name: "Priority Support", available: true },
    teamMembers: { id: "team-members", name: "Team Members", available: true, limit: 4 },
    ssoSAML: { id: "sso-saml", name: "SSO (SAML)", available: false },
    dedicatedSupport: { id: "dedicated-support", name: "Dedicated Support", available: false },
  },
  business: {
    qrCodesIncluded: { id: "qr-codes", name: "QR Codes Included", available: true, limit: 500 },
    linksAndText: { id: "links-text", name: "Links & Text", available: true },
    imagesAndVideo: { id: "images-video", name: "Images & Video", available: true },
    getFoundQR: { id: "get-found-qr", name: "Get Found QR", available: true },
    contactVCard: { id: "contact-vcard", name: "Contact (vCard)", available: true },
    customColorsAndLogo: { id: "custom-colors", name: "Custom Colors & Logo", available: true },
    removeUseQRBranding: { id: "remove-branding", name: "Remove UseQR Branding", available: true },
    updateContentAnytime: { id: "update-content", name: "Update Content Anytime", available: true },
    smartRedirectDevice: { id: "smart-redirect", name: "Smart Redirect (Device)", available: true },
    expiringQR: { id: "expiring-qr", name: "Expiring QR", available: true },
    scanAnalytics: { id: "scan-analytics", name: "Scan Analytics", available: true, limit: "180 days" },
    csvExport: { id: "csv-export", name: "CSV Export", available: true },
    geoFencedQR: { id: "geo-fenced-qr", name: "Geo-fenced QR", available: true },
    highResDownload: { id: "high-res-download", name: "High-res Download", available: true },
    prioritySupport: { id: "priority-support", name: "Priority Support", available: true },
    teamMembers: { id: "team-members", name: "Team Members", available: true, limit: 10 },
    ssoSAML: { id: "sso-saml", name: "SSO (SAML)", available: true },
    dedicatedSupport: { id: "dedicated-support", name: "Dedicated Support", available: true, enterprise: true },
  },
};

/**
 * Get all features available for a plan
 * @param plan - The plan slug
 * @returns Object containing all features for the plan
 */
export function getPlanFeatures(plan: Plan): PlanFeatureSet {
  return PLAN_CONFIG[plan];
}

/**
 * Get a specific feature for a plan
 * @param plan - The plan slug
 * @param featureKey - The feature key (e.g., "qrCodesIncluded")
 * @returns The feature object or null if not found
 */
export function getPlanFeature(
  plan: Plan,
  featureKey: keyof PlanFeatureSet
): Feature | null {
  const features = PLAN_CONFIG[plan];
  return features[featureKey] || null;
}

/**
 * Check if a feature is available for a plan
 * @param plan - The plan slug
 * @param featureKey - The feature key
 * @returns true if feature is available, false otherwise
 */
export function hasFeature(plan: Plan, featureKey: keyof PlanFeatureSet): boolean {
  const feature = getPlanFeature(plan, featureKey);
  return feature?.available === true;
}

/**
 * Get the limit value for a feature
 * @param plan - The plan slug
 * @param featureKey - The feature key
 * @returns The limit value (number or string) or null if no limit
 */
export function getFeatureLimit(
  plan: Plan,
  featureKey: keyof PlanFeatureSet
): string | number | null {
  const feature = getPlanFeature(plan, featureKey);
  return feature?.limit ?? null;
}

/**
 * Get all available features for a plan (filters out unavailable ones)
 * @param plan - The plan slug
 * @returns Array of available features
 */
export function getAvailableFeatures(plan: Plan): Feature[] {
  const features = getPlanFeatures(plan);
  return Object.values(features).filter((f) => f.available === true);
}

/**
 * Check if a feature is available in at least one of the provided plans
 * Useful for showing features available "in some plans"
 * @param plans - Array of plan slugs
 * @param featureKey - The feature key
 * @returns true if any plan has the feature
 */
export function hasFeatureInAnyPlan(
  plans: Plan[],
  featureKey: keyof PlanFeatureSet
): boolean {
  return plans.some((plan) => hasFeature(plan, featureKey));
}

/**
 * Get the highest (most permissive) limit across multiple plans
 * Useful for determining max team members or max QR codes across plans
 * @param plans - Array of plan slugs
 * @param featureKey - The feature key
 * @returns The highest limit value or null
 */
export function getMaxFeatureLimit(
  plans: Plan[],
  featureKey: keyof PlanFeatureSet
): string | number | null {
  const limits = plans
    .map((plan) => getFeatureLimit(plan, featureKey))
    .filter((limit) => limit !== null && typeof limit === "number") as number[];

  return limits.length > 0 ? Math.max(...limits) : null;
}

/**
 * Check if feature requires an upgrade from current plan
 * @param currentPlan - Current user's plan
 * @param targetFeatureKey - The feature to check
 * @returns true if feature is not available in current plan
 */
export function requiresUpgrade(
  currentPlan: Plan,
  targetFeatureKey: keyof PlanFeatureSet
): boolean {
  return !hasFeature(currentPlan, targetFeatureKey);
}

/**
 * Find minimum plan required for a feature
 * @param featureKey - The feature key
 * @returns The minimum plan that has this feature, or null if only in business
 */
export function getMinimumPlanForFeature(
  featureKey: keyof PlanFeatureSet
): Plan | null {
  const plans: Plan[] = ["free", "starter", "pro", "business"];
  for (const plan of plans) {
    if (hasFeature(plan, featureKey)) {
      return plan;
    }
  }
  return null;
}
