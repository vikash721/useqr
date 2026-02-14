"use client";

import { useEffect } from "react";
import { markScannedInSession } from "@/lib/db/analytics";

type MarkScanSessionProps = {
  qrId: string;
};

/**
 * Client component that marks a QR scan in the session after page load.
 * This sets a cookie to prevent duplicate scan counts on page refresh.
 */
export function MarkScanSession({ qrId }: MarkScanSessionProps) {
  useEffect(() => {
    // Call server action to set the cookie
    markScannedInSession(qrId).catch((err) => {
      console.error("[MarkScanSession] Failed to mark scan:", err);
    });
  }, [qrId]);

  // This component renders nothing
  return null;
}
