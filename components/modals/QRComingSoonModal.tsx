"use client";

import { QrCode } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface QRComingSoonModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QRComingSoonModal({
  open,
  onOpenChange,
}: QRComingSoonModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        closeClassName="text-zinc-400 hover:text-white"
        className="border-white/10 bg-zinc-900 p-0 text-white shadow-2xl sm:max-w-md"
      >
        <div className="flex flex-col items-center px-8 py-10 text-center sm:px-10 sm:py-12">
          <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <QrCode className="size-7 text-emerald-400" />
          </div>
          <DialogHeader className="items-center gap-2">
            <DialogTitle className="text-center text-xl font-semibold tracking-tight text-white sm:text-2xl">
              Coming Soon
            </DialogTitle>
            <DialogDescription className="mx-auto max-w-xs text-center text-sm leading-relaxed text-zinc-400">
              We&apos;re crafting a premium QR code studio. Generate, customize,
              and manage professional QR codes — all in one place.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 flex w-full justify-center sm:justify-center">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-10 items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600"
            >
              Got it
            </button>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
