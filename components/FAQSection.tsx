"use client";

import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQSectionProps {
  title?: string;
  subtitle?: string;
  items: FAQItem[];
  className?: string;
}

export function FAQSection({
  title = "Frequently asked questions",
  subtitle,
  items,
  className,
}: FAQSectionProps) {
  return (
    <section
      className={cn("relative z-10 w-full bg-black px-6 py-20 lg:py-28", className)}
    >
      <div className="mx-auto max-w-3xl">
        <h2 className="text-center text-2xl font-bold tracking-tight text-white sm:text-3xl">
          {title}
        </h2>
        {subtitle && (
          <p className="mx-auto mt-3 max-w-xl text-center text-zinc-400">
            {subtitle}
          </p>
        )}
        <dl className="mt-12 border-y border-white/10">
          {items.map((item, index) => (
            <details
              key={index}
              className="group border-b border-white/10 last:border-b-0"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 text-left font-medium text-white transition-colors hover:text-emerald-400 [&::-webkit-details-marker]:hidden">
                <span className="pr-4">{item.question}</span>
                <ChevronDown
                  className="size-5 shrink-0 text-zinc-500 transition-transform duration-200 group-open:rotate-180 group-open:text-emerald-400"
                  aria-hidden
                />
              </summary>
              <div className="pb-5 pl-0 pr-12">
                <p className="text-sm leading-relaxed text-zinc-400">
                  {item.answer}
                </p>
              </div>
            </details>
          ))}
        </dl>
      </div>
    </section>
  );
}
