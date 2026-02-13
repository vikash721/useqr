"use client";

import { Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export type ChangePlanPreview = {
  amountCents: number;
  currencyCode: string;
};

interface ChangePlanModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Current plan display name (e.g. "Starter", "Pro"). */
  currentPlanName: string;
  /** Target plan display name (e.g. "Pro", "Business"). */
  targetPlanName: string;
  /** Proration preview from API. */
  preview: ChangePlanPreview | null;
  /** Preview is loading. */
  previewLoading: boolean;
  /** Preview failed to load. */
  previewError: boolean;
  /** User confirmed; change in progress. */
  changing: boolean;
  onConfirm: () => void;
}

function formatAmount(amountCents: number, currencyCode: string): string {
  const value = (Math.abs(amountCents) / 100).toFixed(2);
  if (currencyCode === "USD") return `$${value}`;
  if (currencyCode === "EUR") return `€${value}`;
  if (currencyCode === "GBP") return `£${value}`;
  return `${value} ${currencyCode}`;
}

export function ChangePlanModal({
  open,
  onOpenChange,
  currentPlanName,
  targetPlanName,
  preview,
  previewLoading,
  previewError,
  changing,
  onConfirm,
}: ChangePlanModalProps) {
  const handleClose = () => {
    if (!changing) onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        className="border-white/10 bg-zinc-900 text-white sm:max-w-md"
        showCloseButton={!changing}
      >
        <DialogHeader>
          <DialogTitle>Change plan</DialogTitle>
          <DialogDescription className="sr-only">
            Confirm switching from {currentPlanName} to {targetPlanName}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 text-sm">
          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Plan change
            </p>
            <p className="mt-1 font-medium text-white">
              {currentPlanName} → {targetPlanName}
            </p>
          </div>

          <div>
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              What happens
            </p>
            <ul className="mt-1.5 space-y-1 text-zinc-400">
              <li>• Your plan updates immediately.</li>
              <li>• You get access to {targetPlanName} features right away.</li>
            </ul>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/5 p-3">
            <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">
              Payment
            </p>
            {previewLoading ? (
              <p className="mt-1 flex items-center gap-2 text-zinc-400">
                <Loader2 className="size-4 shrink-0 animate-spin" />
                Calculating prorated amount…
              </p>
            ) : previewError ? (
              <p className="mt-1 text-zinc-400">
                Your card on file will be charged a prorated amount when you confirm.
              </p>
            ) : preview ? (
              <p className="mt-1 text-zinc-400">
                {preview.amountCents > 0 ? (
                  <>
                    Your card on file will be charged{" "}
                    <span className="font-semibold text-white">
                      {formatAmount(preview.amountCents, preview.currencyCode)}
                    </span>{" "}
                    when you confirm. Credit for unused time on your current plan is applied first.
                  </>
                ) : preview.amountCents < 0 ? (
                  <>
                    A credit of{" "}
                    <span className="font-semibold text-white">
                      {formatAmount(preview.amountCents, preview.currencyCode)}
                    </span>{" "}
                    will be applied to your account. On renewal, you&apos;ll be charged at the {targetPlanName} price.
                  </>
                ) : (
                  <>No charge now. On renewal, you&apos;ll be charged at the {targetPlanName} price.</>
                )}
              </p>
            ) : (
              <p className="mt-1 text-zinc-400">
                Your card on file will be charged a prorated amount when you confirm.
              </p>
            )}
          </div>
        </div>

        <DialogFooter className="flex flex-row gap-4 pt-2 sm:justify-end">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={changing}
            className="min-w-[88px] border-white/20 text-white hover:bg-white/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={changing || previewLoading}
            className="min-w-[88px] bg-emerald-500 text-white hover:bg-emerald-600"
          >
            {changing ? (
              <>
                <Loader2 className="mr-2 size-4 animate-spin" />
                Changing…
              </>
            ) : (
              "Confirm"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
