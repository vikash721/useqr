"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      theme="dark"
      position="bottom-center"
      closeButton
      expand={false}
      toastOptions={{
        classNames: {
          toast:
            "!rounded-none !border !border-white/10 !bg-zinc-900 !text-white !shadow-lg !cursor-grab",
          title: "!text-white",
          description: "!text-zinc-400",
          closeButton:
            "!rounded-none !border !border-white/10 !bg-white/5 !text-zinc-400 hover:!text-white hover:!bg-white/10",
          success: "!border-emerald-500/30",
          error: "!border-red-500/30",
          warning: "!border-amber-500/30",
        },
      }}
    />
  );
}
