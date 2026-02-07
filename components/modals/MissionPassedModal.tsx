"use client";

import { useEffect, useRef, useState } from "react";
import { Volume2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogTitle,
} from "@/components/ui/dialog";
import { DialogClose } from "@/components/ui/dialog";

interface MissionPassedModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const MISSION_PASSED_SOUND = "/gta_mission_passed.mp3";

export function MissionPassedModal({
  open,
  onOpenChange,
}: MissionPassedModalProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const hasPlayedRef = useRef(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState(false);

  // Preload audio on mount so it's ready when modal opens
  useEffect(() => {
    const audio = new Audio(MISSION_PASSED_SOUND);
    audio.preload = "auto";
    audio.volume = 0.8;
    audioRef.current = audio;
    return () => {
      audio.pause();
      audioRef.current = null;
    };
  }, []);

  // When modal closes: stop music immediately; when open: try to play
  useEffect(() => {
    if (!open) {
      const audio = audioRef.current;
      if (audio) {
        audio.pause();
        audio.currentTime = 0;
      }
      hasPlayedRef.current = false;
      setAutoplayBlocked(false);
      return;
    }
    const audio = audioRef.current;
    if (!audio || hasPlayedRef.current) return;
    const p = audio.play();
    if (p && typeof p.then === "function") {
      p.then(() => {
        hasPlayedRef.current = true;
        setAutoplayBlocked(false);
      }).catch(() => setAutoplayBlocked(true));
    }
  }, [open]);

  const playSound = () => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = 0;
    audio.play().then(() => setAutoplayBlocked(false)).catch(() => {});
  };

  // Play on first user interaction inside modal (browsers allow audio after gesture)
  const handleContentInteraction = () => {
    if (hasPlayedRef.current) return;
    hasPlayedRef.current = true;
    playSound();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="overflow-hidden border-0 bg-black p-0 shadow-2xl ring-2 ring-amber-500/40 ring-offset-0 ring-offset-black"
        aria-describedby={undefined}
        onPointerDownCapture={handleContentInteraction}
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="sr-only">Mission Passed — Your QR was just scanned</DialogTitle>
        <div className="relative flex flex-col items-center px-8 py-10 sm:px-12 sm:py-14">
          {/* Subtle vignette / glow behind image */}
          <div
            className="pointer-events-none absolute inset-0 opacity-60"
            style={{
              background:
                "radial-gradient(ellipse 70% 60% at 50% 35%, rgba(245, 158, 11, 0.15) 0%, transparent 55%)",
            }}
            aria-hidden
          />
          <div className="relative flex flex-col items-center gap-6">
            {/* GTA Respect GIF (Giphy) — img avoids CSP frame-src / iframe blocking */}
            <div
              className="relative aspect-video w-full max-w-[320px] overflow-hidden rounded-none sm:max-w-[380px]"
              style={{ aspectRatio: "1.77778" }}
            >
              <img
                src="https://media2.giphy.com/media/v1.Y2lkPTc5MGI3NjExcnd0OWF0dzUzbzRkYm1mYWk2ZTEyeGx2cW9tMG9wcnZhbXVqdjVqdyZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9dHM/41EMrPA6FbBmKzHDiS/giphy.gif"
                alt="GTA Respect — Mission Passed"
                className="h-full w-full object-contain drop-shadow-[0_0_24px_rgba(245,158,11,0.25)]"
              />
            </div>
            <p className="text-center text-sm font-medium uppercase tracking-[0.35em] text-zinc-400 sm:text-base">
              Your QR was just scanned.
            </p>
            {autoplayBlocked && (
              <button
                type="button"
                onClick={playSound}
                className="inline-flex items-center gap-2 rounded-none border border-amber-500/50 bg-amber-500/10 px-4 py-2 text-sm font-medium text-amber-400 transition-colors hover:bg-amber-500/20"
              >
                <Volume2 className="size-4" />
                Play sound
              </button>
            )}
          </div>
          <DialogFooter className="mt-8 w-full justify-center border-t border-white/10 pt-6 sm:mt-10">
            <div className="flex w-full justify-center">
              <DialogClose asChild>
                <button
                  type="button"
                  className="inline-flex h-11 items-center justify-center rounded-none border border-amber-500/50 bg-amber-500/10 px-8 text-sm font-semibold uppercase tracking-wider text-amber-400 transition-colors hover:bg-amber-500/20 hover:text-amber-300"
                >
                  Scan again
                </button>
              </DialogClose>
            </div>
          </DialogFooter>
        </div>
      </DialogContent>
    </Dialog>
  );
}
