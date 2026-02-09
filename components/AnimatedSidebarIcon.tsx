"use client";

import { gsap } from "gsap";
import type { LucideIcon } from "lucide-react";
import React, { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

type StrokeElement =
  | SVGPathElement
  | SVGRectElement
  | SVGCircleElement
  | SVGLineElement
  | SVGPolylineElement
  | SVGPolygonElement;

const STROKE_SELECTOR = "path, rect, circle, line, polyline, polygon";

/**
 * Sidebar icon with SVG stroke-draw + bounce on hover.
 *
 * Idle: icon fully visible.
 * Hover-in: icon redraws (stroke-dashoffset full → 0) with a subtle scale bounce.
 * Hover-out: instantly resets to fully visible at normal scale. No exit animation.
 */
export function AnimatedSidebarIcon({
  icon: IconComponent,
  isHovered,
  className,
}: {
  icon: LucideIcon;
  isHovered: boolean;
  className?: string;
}) {
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const lengthsRef = useRef<number[]>([]);
  const initRef = useRef(false);
  const hoveredOnceRef = useRef(false);

  // Measure stroke lengths once, right after first paint
  useEffect(() => {
    const wrapper = wrapperRef.current;
    if (!wrapper || initRef.current) return;
    const svg = wrapper.querySelector("svg");
    if (!svg) return;
    const els = svg.querySelectorAll<StrokeElement>(STROKE_SELECTOR);
    lengthsRef.current = Array.from(els).map((el) => {
      const len = el.getTotalLength();
      // Set dash array so we can animate the offset later
      el.style.strokeDasharray = `${len}`;
      el.style.strokeDashoffset = "0"; // fully visible
      return len;
    });
    initRef.current = true;
  }, []);

  useEffect(() => {
    // Don't animate on initial mount — icon starts visible
    if (!hoveredOnceRef.current) {
      if (!isHovered) return;
      hoveredOnceRef.current = true;
    }

    const wrapper = wrapperRef.current;
    if (!wrapper || !initRef.current) return;
    const els = wrapper.querySelectorAll<StrokeElement>(STROKE_SELECTOR);
    if (els.length === 0) return;
    const lengths = lengthsRef.current;

    // Kill ALL running tweens on these targets to prevent overlap
    gsap.killTweensOf(els);
    gsap.killTweensOf(wrapper);

    if (isHovered) {
      // 1. Instantly hide strokes
      els.forEach((el, i) => {
        el.style.strokeDashoffset = `${lengths[i]}`;
      });
      // 2. Draw them in
      gsap.to(els, {
        strokeDashoffset: 0,
        duration: 0.45,
        ease: "power3.out",
        stagger: 0.04,
      });
      // 3. Scale bounce
      gsap.fromTo(
        wrapper,
        { scale: 1 },
        { scale: 1.15, duration: 0.25, ease: "back.out(2)", yoyo: true, repeat: 1, repeatDelay: 0.05 },
      );
    } else {
      // Instant reset — no exit animation, just snap back to visible
      els.forEach((el) => {
        el.style.strokeDashoffset = "0";
      });
      gsap.set(wrapper, { scale: 1 });
    }
  }, [isHovered]);

  return (
    <span
      ref={wrapperRef}
      className={cn("inline-flex shrink-0 origin-center", className)}
    >
      <IconComponent className="size-4" strokeWidth={2} />
    </span>
  );
}

/**
 * Wraps `<SidebarMenuItem>` (the full-width <li>) so hovering anywhere
 * on the row — padding, label, icon — triggers the animated icon.
 */
export function SidebarNavItem({
  children,
  className,
}: {
  children: (props: { isHovered: boolean }) => React.ReactNode;
  className?: string;
}) {
  const [isHovered, setIsHovered] = React.useState(false);

  return (
    <li
      data-sidebar="menu-item"
      className={cn("group/menu-item relative", className)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {children({ isHovered })}
    </li>
  );
}
