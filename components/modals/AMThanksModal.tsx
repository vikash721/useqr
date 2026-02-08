"use client";

import Image from "next/image";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

/**
 * Modal shown when ?view=am is in the URL. Displays AM Hacks card and a thank-you message signed by Viaksh.
 */
export function AMThanksModal() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const open = searchParams.get("view") === "am";

  const handleOpenChange = (next: boolean) => {
    if (!next) {
      const params = new URLSearchParams(searchParams.toString());
      params.delete("view");
      const query = params.toString();
      router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg border-border bg-card p-0 text-card-foreground shadow-xl">
        <div className="flex flex-row items-stretch gap-4 p-4">
          <div className="relative shrink-0 w-36 overflow-hidden rounded-lg border border-border bg-muted/30 sm:w-40">
            <Image
              src="/am-hacks.png"
              alt="AM Hacks 2.0"
              width={160}
              height={160}
              className="h-full w-full object-contain"
              priority
            />
          </div>
          <div className="flex min-w-0 flex-1 flex-col justify-center gap-1.5 py-1 text-left">
            <DialogHeader className="gap-1.5 p-0 text-left">
              <DialogTitle className="text-lg font-semibold tracking-tight">
                Thanks for considering our project
              </DialogTitle>
              <DialogDescription asChild>
                <p className="text-sm italic leading-relaxed text-muted-foreground">
                  &ldquo;It means a lot that you took the time to take a look. We&apos;re building something we care about, and your interest encourages us to keep going.&rdquo;
                </p>
              </DialogDescription>
            </DialogHeader>
            <div className="flex items-center justify-end gap-1.5">
              <div className="relative h-6 w-6 shrink-0 overflow-hidden rounded-full border border-border bg-muted/30">
                <Image
                  src="/founders/vikash-kumar.png"
                  alt="Vikash"
                  width={24}
                  height={24}
                  className="h-full w-full object-cover"
                  priority
                />
              </div>
              <p className="text-sm text-muted-foreground leading-none">
                Vikash Kumar.
              </p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
