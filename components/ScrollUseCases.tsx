"use client";

import { useEffect, useRef, useState } from "react";
import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { forwardRef } from "react";

export interface UseCaseItem {
  label?: string;
  number?: number;
  icon: LucideIcon;
  title: string;
  description: string;
  accent?: "emerald" | "zinc";
}

interface ScrollUseCasesProps {
  items: UseCaseItem[];
  className?: string;
}

/**
 * ScrollUseCases — Horizontal card carousel driven by vertical scrolling.
 *
 * A tall wrapper creates scroll runway. Inside, a sticky viewport
 * translates the card track horizontally based on scroll progress.
 * The card nearest the viewport centre gets a scale / opacity boost.
 */
export function ScrollUseCases({ items, className }: ScrollUseCasesProps) {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [progress, setProgress] = useState(0);
  const [activeIdx, setActiveIdx] = useState(0);

  // Convert vertical scroll position into horizontal progress [0..1]
  // and determine which card is closest to the viewport centre.
  useEffect(() => {
    const onScroll = () => {
      const wrapper = wrapperRef.current;
      if (!wrapper) return;

      const rect = wrapper.getBoundingClientRect();
      const wrapperHeight = wrapper.offsetHeight;
      const stickyHeight = window.innerHeight;
      const scrollable = wrapperHeight - stickyHeight;

      if (scrollable <= 0) {
        setProgress(0);
        setActiveIdx(0);
        return;
      }

      const scrolled = -rect.top;
      const p = Math.max(0, Math.min(1, scrolled / scrollable));
      setProgress(p);

      // Map progress directly to card index
      // At p=0 → card 0, at p=1 → last card
      const floatIdx = p * (items.length - 1);
      setActiveIdx(Math.round(floatIdx));
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, [items.length]);

  // Calculate translateX: at progress=0 first card centred, at progress=1 last card centred.
  // Each card ref tells us its offsetLeft and width so this is pixel-accurate.
  const getTranslateX = () => {
    const track = trackRef.current;
    if (!track || cardRefs.current.length === 0) return 0;

    const vw = window.innerWidth;
    const firstCard = cardRefs.current[0];
    const lastCard = cardRefs.current[items.length - 1];
    if (!firstCard || !lastCard) return 0;

    // Offset that centres the first card
    const startX = firstCard.offsetLeft + firstCard.offsetWidth / 2 - vw / 2;
    // Offset that centres the last card
    const endX = lastCard.offsetLeft + lastCard.offsetWidth / 2 - vw / 2;

    return -(startX + progress * (endX - startX));
  };

  const translateX = getTranslateX();

  // Height of the wrapper — controls how much vertical scroll the user needs.
  const runwayHeight = `${Math.max(100, items.length * 80)}vh`;

  return (
    <div
      ref={wrapperRef}
      className={cn("relative", className)}
      style={{ height: runwayHeight }}
    >
      {/* Sticky viewport — stays fixed while user scrolls through the wrapper */}
      <div className="sticky top-0 flex h-screen w-full items-center overflow-hidden">
        {/* Horizontal track */}
        <div
          ref={trackRef}
          className="flex gap-6 transition-transform duration-100 ease-out will-change-transform md:gap-8"
          style={{ transform: `translateX(${translateX}px)` }}
        >
          {items.map((item, i) => (
            <HorizontalCard
              key={i}
              ref={(el) => { cardRefs.current[i] = el; }}
              item={item}
              isActive={i === activeIdx}
            />
          ))}
        </div>

        {/* Progress dots */}
        <div className="absolute bottom-10 left-1/2 flex -translate-x-1/2 gap-2">
          {items.map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-1.5 rounded-full transition-all duration-300",
                i === activeIdx
                  ? "w-6 bg-emerald-400"
                  : "w-1.5 bg-white/20",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

/* ─── Individual card ────────────────────────────────────────────────────── */

const accentMap = {
  emerald: {
    icon: "text-emerald-400",
    border: "border-emerald-500/30",
    bgIcon: "bg-emerald-500/10",
    activeBorder: "border-emerald-500/50",
  },
  zinc: {
    icon: "text-zinc-400",
    border: "border-white/10",
    bgIcon: "bg-white/5",
    activeBorder: "border-white/20",
  },
} as const;

interface HorizontalCardProps {
  item: UseCaseItem;
  isActive: boolean;
}

function HorizontalCardInner({ item, isActive }: HorizontalCardProps, ref: React.Ref<HTMLDivElement>) {
  const { icon: Icon, title, description, label, number, accent = "emerald" } = item;
  const a = accentMap[accent];

  const displayLabel =
    label != null
      ? number != null
        ? `${label} ${number}`
        : label
      : number != null
        ? `Use case ${number}`
        : null;

  return (
    <div
      ref={ref}
      className={cn(
        // Base
        "relative flex w-[min(85vw,28rem)] shrink-0 flex-col rounded-none border bg-zinc-900/95 p-8 backdrop-blur-sm",
        "transition-all duration-500 ease-out",
        // Active vs inactive
        isActive
          ? cn("scale-100", a.activeBorder, "shadow-2xl shadow-emerald-500/10")
          : cn("scale-[0.92] opacity-50", "border-white/5", "shadow-none"),
      )}
    >
      {/* Glow on active */}
      {isActive && (
        <div className="pointer-events-none absolute -inset-px -z-10 rounded-none bg-gradient-to-br from-emerald-500/10 via-transparent to-emerald-500/5" />
      )}

      {displayLabel && (
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          {displayLabel}
        </span>
      )}

      <div
        className={cn(
          "mt-3 flex size-12 shrink-0 items-center justify-center rounded-lg border",
          a.border,
          a.bgIcon,
        )}
      >
        <Icon className={cn("size-6", a.icon)} strokeWidth={1.5} />
      </div>

      <h3 className="mt-5 text-xl font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-3 text-sm leading-relaxed text-zinc-400 sm:text-base">
        {description}
      </p>
    </div>
  );
}

const HorizontalCard = forwardRef(HorizontalCardInner);

export default ScrollUseCases;
