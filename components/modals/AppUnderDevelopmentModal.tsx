"use client";

import { Rocket } from "lucide-react";
import Link from "next/link";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface AppUnderDevelopmentModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AppUnderDevelopmentModal({
  open,
  onOpenChange,
}: AppUnderDevelopmentModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={true}
        closeClassName="text-zinc-400 hover:text-white"
        className="border-white/10 bg-zinc-900 p-0 text-white shadow-2xl"
      >
        <div className="flex flex-col items-center px-8 py-10 text-center sm:px-10 sm:py-12">
          <div className="mb-6 flex size-14 items-center justify-center rounded-full border border-emerald-500/30 bg-emerald-500/10">
            <Rocket className="size-7 text-emerald-400" />
          </div>
          <DialogHeader className="gap-2">
            <DialogTitle className="text-xl font-semibold tracking-tight text-white sm:text-2xl">
              App coming soon
            </DialogTitle>
            <DialogDescription className="text-base text-zinc-400">
              Our app is under development and will be live soon. Use the web
              version in the meantime—same features, works everywhere.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-8 w-full sm:justify-center">
            <Link
              href="/login"
              onClick={() => onOpenChange(false)}
              className="inline-flex h-11 w-full items-center justify-center rounded-none bg-emerald-500 px-8 text-sm font-medium text-white transition-colors hover:bg-emerald-600 sm:w-auto"
            >
              Continue on web
            </Link>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
