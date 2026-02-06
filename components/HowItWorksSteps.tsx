"use client";

import { cn } from "@/lib/utils";

export interface Step {
  number: number;
  title: string;
  description: string;
}

export interface HowItWorksStepsProps {
  steps: Step[];
  className?: string;
}

export function HowItWorksSteps({ steps, className }: HowItWorksStepsProps) {
  return (
    <div
      className={cn(
        "grid w-full gap-8 sm:gap-12 lg:grid-cols-4 lg:gap-6",
        className
      )}
    >
      {steps.map((step, index) => (
        <div key={step.number} className="relative flex flex-col items-center">
          {/* Connector line — between steps, hidden on last and on mobile when stacked */}
          {index < steps.length - 1 && (
            <div
              className="absolute left-1/2 top-8 hidden h-px w-[calc(100%+1.5rem)] lg:block"
              aria-hidden
            >
              <div className="h-full w-full bg-gradient-to-r from-emerald-500/40 via-emerald-500/20 to-transparent" />
            </div>
          )}

          {/* Step number — boxy, emerald accent */}
          <div
            className={cn(
              "relative z-10 flex size-14 shrink-0 items-center justify-center rounded-none border bg-zinc-900/95 font-mono text-lg font-semibold tracking-tight",
              "border-emerald-500/30 text-emerald-400",
              "shadow-[0_0_0_1px_rgba(0,0,0,0.5)]"
            )}
            aria-hidden
          >
            {String(step.number).padStart(2, "0")}
          </div>

          {/* Content */}
          <div className="mt-6 flex flex-1 flex-col text-center lg:mt-8">
            <h3 className="text-base font-semibold tracking-tight text-white sm:text-lg">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-zinc-400">
              {step.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
