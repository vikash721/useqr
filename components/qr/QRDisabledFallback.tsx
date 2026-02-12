import { ShieldOff } from "lucide-react";

/**
 * Shown when someone scans a QR that is disabled (or not active).
 * Rendered by the scan page (/q/[id]) when qr.status !== "active".
 */
export function QRDisabledFallback() {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-background px-4 py-12">
      <div className="flex max-w-sm flex-col items-center gap-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-muted">
          <ShieldOff className="size-8 text-muted-foreground" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-foreground">
            This QR code is disabled
          </h1>
          <p className="text-sm text-muted-foreground">
            The owner has temporarily disabled this QR code. It may be enabled again later.
          </p>
        </div>
      </div>
    </div>
  );
}
