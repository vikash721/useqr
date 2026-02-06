"use client";

import { type LucideIcon } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export interface UseCaseCardProps {
  /** Short label above the title (e.g. "Use case") */
  label?: string;
  /** Number shown after the label (e.g. 1 → "Use case 1") */
  number?: number;
  /** Lucide icon shown at the top */
  icon: LucideIcon;
  /** Card title */
  title: string;
  /** Short description of the use case */
  description: string;
  /** Optional link – makes the whole card clickable */
  href?: string;
  /** Optional accent color for icon/border (default: emerald) */
  accent?: "emerald" | "zinc";
  className?: string;
}

const accentStyles = {
  emerald: "text-emerald-400 border-emerald-500/20 hover:border-emerald-500/40 [&_.use-case-icon]:text-emerald-400",
  zinc: "text-zinc-400 border-white/10 hover:border-white/20 [&_.use-case-icon]:text-zinc-400",
} as const;

export function UseCaseCard({
  label,
  number,
  icon: Icon,
  title,
  description,
  href,
  accent = "emerald",
  className,
}: UseCaseCardProps) {
  const displayLabel =
    label != null
      ? number != null
        ? `${label} ${number}`
        : label
      : number != null
        ? `Use case ${number}`
        : null;

  const cardContent = (
    <>
      {displayLabel && (
        <span className="text-[10px] font-medium uppercase tracking-[0.2em] text-zinc-500">
          {displayLabel}
        </span>
      )}
      <div className="use-case-icon mt-3 flex size-10 shrink-0 items-center justify-center rounded-none border border-current/30 bg-current/5">
        <Icon className="size-5" strokeWidth={1.5} />
      </div>
      <h3 className="mt-4 text-lg font-semibold tracking-tight text-white">
        {title}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-zinc-400">
        {description}
      </p>
    </>
  );

  const cardClassName = cn(
    "group flex w-full flex-col rounded-none border bg-zinc-900/95 p-6 shadow-lg transition-colors duration-200",
    "backdrop-blur-sm border-white/10",
    accentStyles[accent],
    className
  );

  if (href) {
    return (
      <Link href={href} className={cardClassName}>
        {cardContent}
      </Link>
    );
  }

  return <div className={cardClassName}>{cardContent}</div>;
}
