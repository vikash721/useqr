"use client";

import { useEffect, useRef } from "react";
import { recordScan } from "@/lib/db/analytics";

type MarkScanSessionProps = {
  qrId: string;
  utm?: {
    utmSource?: string;
    utmMedium?: string;
    utmCampaign?: string;
    utmContent?: string;
  };
};

/**
 * Client component that records a scan and prevents duplicates on page refresh.
 * Uses sessionStorage (tab-isolated) to track if this QR was already scanned in this tab.
 * Each new tab = fresh sessionStorage = new scan recorded.
 */
export function MarkScanSession({ qrId, utm }: MarkScanSessionProps) {
  // Store utm in a ref so it's not a dependency of useEffect.
  // The utm value is only needed on the first call and never changes for a given page load.
  const utmRef = useRef(utm);

  useEffect(() => {
    const sessionKey = `qr_scanned_${qrId}`;
    if (sessionStorage.getItem(sessionKey)) return;

    recordScan(qrId, utmRef.current)
      .then(() => {
        sessionStorage.setItem(sessionKey, "1");
      })
      .catch((err) => {
        console.error("[MarkScanSession] Failed to record scan:", err);
      });
  }, [qrId]);

  return null;
}
