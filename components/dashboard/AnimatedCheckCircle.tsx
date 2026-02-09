"use client";

import { gsap } from "gsap";
import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

/**
 * Animated check-in-circle: circle draws with stroke, then the check draws.
 * Uses GSAP for a stylish reveal.
 */
export function AnimatedCheckCircle({ className }: { className?: string }) {
  const svgRef = useRef<SVGSVGElement>(null);
  const circleRef = useRef<SVGCircleElement>(null);
  const checkRef = useRef<SVGPathElement>(null);
  const lengthsRef = useRef<{ circle: number; check: number }>({ circle: 0, check: 0 });
  const initRef = useRef(false);

  useEffect(() => {
    const svg = svgRef.current;
    const circle = circleRef.current;
    const check = checkRef.current;
    if (!svg || !circle || !check) return;

    const circleLen = circle.getTotalLength();
    const checkLen = check.getTotalLength();
    lengthsRef.current = { circle: circleLen, check: checkLen };

    circle.style.strokeDasharray = String(circleLen);
    circle.style.strokeDashoffset = String(circleLen);
    check.style.strokeDasharray = String(checkLen);
    check.style.strokeDashoffset = String(checkLen);
    initRef.current = true;
  }, []);

  useEffect(() => {
    const t = setTimeout(() => {
      const circle = circleRef.current;
      const check = checkRef.current;
      if (!circle || !check || !initRef.current) return;

      const { circle: circleLen, check: checkLen } = lengthsRef.current;

      gsap.killTweensOf([circle, check]);
      gsap.set(circle, { strokeDashoffset: circleLen });
      gsap.set(check, { strokeDashoffset: checkLen });

      const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
      tl.to(circle, { strokeDashoffset: 0, duration: 0.5 })
        .to(check, { strokeDashoffset: 0, duration: 0.35, ease: "power2.inOut" }, "-=0.15");
    }, 80);

    return () => {
      clearTimeout(t);
      gsap.killTweensOf([circleRef.current, checkRef.current].filter(Boolean));
    };
  }, []);

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("size-7 text-emerald-500", className)}
      aria-hidden
    >
      <circle
        ref={circleRef}
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        ref={checkRef}
        d="M8 12l3 3 5-6"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
