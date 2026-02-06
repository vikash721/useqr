/**
 * Toast manager — re-exports Sonner and themed helpers.
 * Use these across the app for consistent, theme-matched toasts.
 */

import { toast as sonnerToast, type ExternalToast } from "sonner";

// Re-export toast so you can use: import { toast } from '@/lib/toast'
export const toast = sonnerToast;

/**
 * Success toast (green / emerald accent)
 * Example: toast.success('QR created');
 */
export function success(message: string, options?: ExternalToast) {
  return sonnerToast.success(message, options);
}

/**
 * Error toast
 * Example: toast.error('Something went wrong');
 */
export function error(message: string, options?: ExternalToast) {
  return sonnerToast.error(message, options);
}

/**
 * Info toast
 * Example: toast.info('Link copied');
 */
export function info(message: string, options?: ExternalToast) {
  return sonnerToast.info(message, options);
}

/**
 * Warning toast
 * Example: toast.warning('Limit reached');
 */
export function warning(message: string, options?: ExternalToast) {
  return sonnerToast.warning(message, options);
}

/**
 * Promise toast — shows loading then success/error
 * Example: toast.promise(fetch(...), { loading: 'Saving...', success: 'Saved!', error: 'Failed' });
 */
export const promise = sonnerToast.promise;

/**
 * Loading toast — dismiss manually with toast.dismiss(id)
 * Example: const id = toast.loading('Creating...'); ... toast.dismiss(id);
 */
export function loading(message: string, options?: ExternalToast) {
  return sonnerToast.loading(message, options);
}

/**
 * Dismiss a toast by id, or all toasts
 * Example: toast.dismiss(); or toast.dismiss(id);
 */
export function dismiss(id?: string | number) {
  return sonnerToast.dismiss(id);
}

const DEV_NOTICE_TOAST_ID = "dev-notice";

/**
 * Development notice — "Under Development - links might not work"
 * Used on landing page; user can close. Uses fixed id so refresh/visit shows one toast.
 */
export function showDevelopmentNotice() {
  return sonnerToast.info("Under Development", {
    id: DEV_NOTICE_TOAST_ID,
    description: "Links might not work. You can close this notice.",
    duration: Infinity,
    closeButton: true,
  });
}
