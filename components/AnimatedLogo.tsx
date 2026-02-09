"use client";

import { gsap } from "gsap";
import React, { useCallback, useEffect, useImperativeHandle, useRef } from "react";
import { cn } from "@/lib/utils";

export type AnimatedLogoHandle = {
  replay: () => void;
};

/**
 * Animated UseQR logo for the sidebar header.
 *
 * Plays a stroke-draw + corner-bounce animation on mount and on every hover.
 */
export const AnimatedLogo = React.forwardRef<AnimatedLogoHandle, { className?: string }>(function AnimatedLogo({ className }, ref) {
  const svgRef = useRef<SVGSVGElement>(null);
  const lengthsRef = useRef<{ outer: number; inner: number }>({ outer: 0, inner: 0 });
  const initRef = useRef(false);

  // Measure stroke lengths once
  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || initRef.current) return;
    const outer = svg.querySelector<SVGRectElement>("[data-logo='outer']");
    const inner = svg.querySelector<SVGRectElement>("[data-logo='inner']");
    if (!outer || !inner) return;
    lengthsRef.current = {
      outer: outer.getTotalLength(),
      inner: inner.getTotalLength(),
    };
    outer.style.strokeDasharray = `${lengthsRef.current.outer}`;
    inner.style.strokeDasharray = `${lengthsRef.current.inner}`;
    initRef.current = true;
  }, []);

  const playDraw = useCallback(() => {
    const svg = svgRef.current;
    if (!svg || !initRef.current) return;

    const outer = svg.querySelector<SVGRectElement>("[data-logo='outer']");
    const inner = svg.querySelector<SVGRectElement>("[data-logo='inner']");
    const cornerTL = svg.querySelector<SVGRectElement>("[data-logo='corner-tl']");
    const cornerBR = svg.querySelector<SVGRectElement>("[data-logo='corner-br']");
    if (!outer || !inner || !cornerTL || !cornerBR) return;

    const { outer: outerLen, inner: innerLen } = lengthsRef.current;

    // Kill any running tweens
    gsap.killTweensOf([outer, inner, cornerTL, cornerBR]);

    // Reset to hidden
    gsap.set(outer, { strokeDashoffset: outerLen, opacity: 1 });
    gsap.set(inner, { strokeDashoffset: innerLen, opacity: 1 });
    gsap.set([cornerTL, cornerBR], {
      scale: 0,
      transformOrigin: "center center",
      opacity: 0,
    });

    // Play draw
    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    tl.to(outer, { strokeDashoffset: 0, duration: 0.6 })
      .to(inner, { strokeDashoffset: 0, duration: 0.5 }, "-=0.3")
      .to(
        cornerTL,
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2.5)" },
        "-=0.15"
      )
      .to(
        cornerBR,
        { scale: 1, opacity: 1, duration: 0.35, ease: "back.out(2.5)" },
        "-=0.2"
      );
  }, []);

  // Expose replay to parent
  useImperativeHandle(ref, () => ({ replay: playDraw }), [playDraw]);

  // Play on mount
  useEffect(() => {
    // Small delay so stroke lengths are measured first
    const t = setTimeout(playDraw, 50);
    return () => clearTimeout(t);
  }, [playDraw]);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 50 50"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-full cursor-pointer", className)}
      onMouseEnter={playDraw}
    >
      {/* Outer border */}
      <rect
        data-logo="outer"
        x="1.25"
        y="1.25"
        width="47.5"
        height="47.5"
        stroke="white"
        strokeWidth="2.5"
        opacity="0"
      />

      {/* Inner border */}
      <rect
        data-logo="inner"
        x="8"
        y="8"
        width="33"
        height="33"
        fill="#2E2E2E"
        fillOpacity="0.83"
        stroke="white"
        strokeWidth="2"
        opacity="0"
      />

      {/* Corner square — top left */}
      <rect
        data-logo="corner-tl"
        x="7"
        y="7"
        width="10"
        height="10"
        fill="white"
      />

      {/* Corner square — bottom right */}
      <rect
        data-logo="corner-br"
        x="32"
        y="32"
        width="10"
        height="10"
        fill="white"
      />
    </svg>
  );
});
