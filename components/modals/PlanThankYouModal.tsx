"use client";

import { CheckCircle2, Heart } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface PlanThankYouModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  /** Show post-payment success message (default) or the "coming soon" contact message. */
  variant?: "success" | "coming_soon";
  /** Plan name to show in success message (e.g. "Starter", "Pro"). */
  planName?: string;
}

export function PlanThankYouModal({
  open,
  onOpenChange,
  variant = "coming_soon",
  planName,
}: PlanThankYouModalProps) {
  const isSuccess = variant === "success";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        closeClassName="text-zinc-400 hover:text-white"
        className="border-white/10 bg-zinc-900 p-0 text-white shadow-2xl"
      >
        <div className="flex flex-col items-center px-8 py-10 text-center sm:px-10 sm:py-12">
          <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            {isSuccess ? (
              <CheckCircle2 className="size-7 text-emerald-400" />
            ) : (
              <Heart className="size-7 text-emerald-400" />
            )}
          </div>
          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl text-center font-semibold tracking-tight text-white sm:text-2xl">
              {isSuccess ? "Thank you for your purchase" : "Thank you so much for your interest"}
            </DialogTitle>
            <DialogDescription className="text-base text-center leading-relaxed text-zinc-400">
              {isSuccess ? (
                <>
                  Your subscription is now active.
                  {planName ? (
                    <> You have full access to <span className="font-medium text-white">{planName}</span> features.</>
                  ) : (
                    " You have full access to your plan’s features."
                  )}
                </>
              ) : (
                <>
                  It really means a lot to us that you want to be part of UseQR. Our
                  payments aren&apos;t live yet—we&apos;re working on it. In the
                  meantime, reach out to us directly and we&apos;ll get you set up
                  personally. We&apos;d love to hear from you.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          {!isSuccess && (
            <div className="mt-6 rounded border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300">
              <span className="font-medium text-white">Contact us:</span>{" "}
              <a
                href="mailto:useqr.codes@gmail.com"
                className="text-emerald-400 underline-offset-2 hover:text-emerald-300"
              >
                useqr.codes@gmail.com
              </a>
            </div>
          )}
          <DialogFooter className="mt-8 w-full sm:justify-center">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="cursor-pointer inline-flex h-11 w-full items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600 sm:w-auto"
            >
              {isSuccess ? "Continue" : "Got it"}
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
