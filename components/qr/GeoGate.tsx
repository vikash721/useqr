"use client";

import { useState, useEffect, useCallback, type ReactNode } from "react";
import { MapPin, Loader2, ShieldX, ShieldAlert, LocateOff } from "lucide-react";

type GeoGateProps = {
  qrId: string;
  geoLock: { lat: number; lng: number; radiusMeters: number };
  /** If set, redirect to this URL after geo validation passes (for redirect-type QRs). */
  redirectUrl?: string;
  /** Content to render after geo validation passes (for landing-type QRs). */
  children?: ReactNode;
};

type GateState =
  | { status: "loading"; message: string }
  | { status: "permission_needed"; message: string }
  | { status: "denied"; message: string }
  | { status: "allowed" };

export function GeoGate({ qrId, redirectUrl, children }: GeoGateProps) {
  const [state, setState] = useState<GateState>({
    status: "loading",
    message: "Verifying your location…",
  });

  const validate = useCallback(async () => {
    // 1. Check geolocation support
    if (!navigator.geolocation) {
      setState({
        status: "permission_needed",
        message: "Your browser doesn't support location services. Please use a modern browser to access this QR.",
      });
      return;
    }

    // 2. Request location
    setState({ status: "loading", message: "Requesting location access…" });

    try {
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 15_000,
            maximumAge: 0,
          });
        }
      );

      const { latitude, longitude } = position.coords;

      // 3. Call backend for validation
      setState({ status: "loading", message: "Verifying your location…" });

      const res = await fetch(`/api/qrs/${qrId}/geo-check`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lat: latitude, lng: longitude }),
      });

      if (!res.ok) {
        setState({
          status: "denied",
          message: "Could not verify your location. Please try again.",
        });
        return;
      }

      const data = (await res.json()) as { allowed: boolean };

      if (data.allowed) {
        if (redirectUrl) {
          window.location.href = redirectUrl;
          return;
        }
        setState({ status: "allowed" });
      } else {
        setState({
          status: "denied",
          message: "You're outside the allowed area for this QR code.",
        });
      }
    } catch (err) {
      // GeolocationPositionError codes: 1 = PERMISSION_DENIED, 2 = POSITION_UNAVAILABLE, 3 = TIMEOUT
      const geoErr = err as GeolocationPositionError | undefined;
      const code = geoErr?.code;
      if (code === 1) {
        setState({
          status: "permission_needed",
          message: "This QR code requires your location to work. Please allow location access in your browser settings and try again.",
        });
      } else if (code === 3) {
        setState({
          status: "permission_needed",
          message: "Location request timed out. Please make sure location services are enabled and try again.",
        });
      } else if (code === 2) {
        setState({
          status: "permission_needed",
          message: "Could not determine your location. Please check that location services are turned on.",
        });
      } else {
        // Non-geolocation error (e.g. network failure)
        setState({
          status: "denied",
          message: "Something went wrong while checking your location. Please try again.",
        });
      }
    }
  }, [qrId, redirectUrl]);

  useEffect(() => {
    validate();
  }, [validate]);

  if (state.status === "allowed") {
    return <>{children}</>;
  }

  // --- Permission needed (location denied / unavailable) ---
  if (state.status === "permission_needed") {
    return (
      <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-amber-50 to-orange-50 px-4 dark:from-zinc-900 dark:to-zinc-950">
        <div className="w-full max-w-sm text-center">
          <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-amber-200/50 dark:bg-zinc-800 dark:ring-amber-500/20">
            <LocateOff className="size-7 text-amber-500" />
          </div>

          <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
            Location Permission Required
          </h1>

          <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
            {state.message}
          </p>

          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                setState({ status: "loading", message: "Retrying…" });
                validate();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-amber-500 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-amber-600"
            >
              <MapPin className="size-4" />
              Allow &amp; try again
            </button>

            <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-left dark:border-amber-500/20 dark:bg-amber-500/5">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                How to enable location:
              </p>
              <ul className="mt-1.5 space-y-1 text-xs text-amber-600 dark:text-amber-400/80">
                <li>• Tap the lock/info icon in your browser&apos;s address bar</li>
                <li>• Find &quot;Location&quot; and set it to &quot;Allow&quot;</li>
                <li>• Reload this page and try again</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Access denied (outside area) or loading ---
  return (
    <div className="flex min-h-svh items-center justify-center bg-gradient-to-br from-zinc-50 to-zinc-100 px-4 dark:from-zinc-900 dark:to-zinc-950">
      <div className="w-full max-w-sm text-center">
        <div className="mx-auto mb-6 flex size-16 items-center justify-center rounded-2xl bg-white shadow-lg ring-1 ring-black/5 dark:bg-zinc-800 dark:ring-white/10">
          {state.status === "loading" ? (
            <Loader2 className="size-7 animate-spin text-emerald-500" />
          ) : (
            <ShieldX className="size-7 text-red-500" />
          )}
        </div>

        <h1 className="text-lg font-semibold text-zinc-900 dark:text-zinc-100">
          {state.status === "loading" ? "Location Check" : "Access Restricted"}
        </h1>

        <p className="mt-2 text-sm leading-relaxed text-zinc-500 dark:text-zinc-400">
          {state.message}
        </p>

        {state.status === "denied" && (
          <div className="mt-6 space-y-3">
            <button
              type="button"
              onClick={() => {
                setState({ status: "loading", message: "Retrying…" });
                validate();
              }}
              className="inline-flex items-center gap-2 rounded-lg bg-zinc-900 px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-colors hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-zinc-200"
            >
              <MapPin className="size-4" />
              Try again
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500">
              <ShieldAlert className="size-3.5" />
              This QR is restricted to a specific area
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
