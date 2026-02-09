"use client";

import * as React from "react";
import { CalendarIcon } from "lucide-react";
import type { DateRange, Matcher } from "react-day-picker";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/lib/utils";

function toDate(str: string): Date {
  if (!str) return new Date();
  return new Date(str + "T12:00:00");
}

function toYYYYMMDD(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function formatRangeLabel(from: string, to: string): string {
  const dFrom = toDate(from);
  const dTo = toDate(to);
  const opts: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: dFrom.getFullYear() !== dTo.getFullYear() ? "numeric" : undefined,
  };
  const a = dFrom.toLocaleDateString("en-US", opts);
  const b = dTo.toLocaleDateString("en-US", opts);
  return from === to ? a : `${a} – ${b}`;
}

export type DateRangeValue = { from: string; to: string };

export interface DateRangePickerProps {
  value: DateRangeValue;
  onChange: (range: DateRangeValue) => void;
  minDate?: string;
  maxDate?: string;
  placeholder?: string;
  className?: string;
  /** Optional: align popover (e.g. "end" for right-align) */
  align?: "start" | "center" | "end";
}

export function DateRangePicker({
  value,
  onChange,
  minDate,
  maxDate,
  placeholder = "Pick a date range",
  className,
  align = "start",
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false);

  // Internal draft state — only committed to parent when both from & to are set
  const [draft, setDraft] = React.useState<DateRange | undefined>(undefined);

  // Tracks whether the user is picking the first date (false) or the second (true)
  const pickingToRef = React.useRef(false);

  // Sync draft from value when popover opens
  const handleOpenChange = React.useCallback(
    (next: boolean) => {
      if (next) {
        // Reset draft to current committed value when opening
        setDraft({
          from: value?.from?.trim() ? toDate(value.from) : undefined,
          to: value?.to?.trim() ? toDate(value.to) : undefined,
        });
        pickingToRef.current = false;
      }
      setOpen(next);
    },
    [value]
  );

  const disabled = React.useMemo((): Matcher[] | undefined => {
    const matchers: Matcher[] = [];
    if (minDate) matchers.push({ before: toDate(minDate) });
    if (maxDate) matchers.push({ after: toDate(maxDate) });
    return matchers.length > 0 ? matchers : undefined;
  }, [minDate, maxDate]);

  const handleSelect = React.useCallback(
    (selected: DateRange | undefined) => {
      if (!selected?.from) return;

      if (!pickingToRef.current) {
        // First click — start a fresh range (only from, clear to)
        setDraft({ from: selected.from, to: undefined });
        pickingToRef.current = true;
      } else {
        // Second click — set the end date
        let from = draft?.from ?? selected.from;
        let to = selected.to ?? selected.from;

        // Ensure from <= to; if user picks an earlier date, swap
        if (from > to) {
          [from, to] = [to, from];
        }

        setDraft({ from, to });
        pickingToRef.current = false;

        // Commit
        onChange({ from: toYYYYMMDD(from), to: toYYYYMMDD(to) });
        setOpen(false);
      }
    },
    [onChange, draft]
  );

  // Determine what the calendar shows visually
  const calendarSelected = draft;

  // Label always reflects the committed (parent) value
  const hasFrom = value?.from?.trim();
  const hasTo = value?.to?.trim();

  // Show in-progress hint when picking
  const draftLabel =
    draft?.from && !draft?.to
      ? `${formatRangeLabel(toYYYYMMDD(draft.from), toYYYYMMDD(draft.from))} – …`
      : null;

  const label = draftLabel && open
    ? draftLabel
    : hasFrom && hasTo
      ? formatRangeLabel(value.from, value.to)
      : placeholder;

  return (
    <Popover open={open} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            "flex h-9 w-fit items-center gap-2 rounded-md border border-border bg-background px-3 py-2 text-left text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground hover:bg-muted/50 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/25 disabled:pointer-events-none disabled:opacity-50",
            !hasFrom && "text-muted-foreground",
            className
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="truncate">{label}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align={align}>
        <Calendar
          mode="range"
          selected={calendarSelected}
          onSelect={handleSelect}
          disabled={disabled}
          startMonth={minDate?.trim() ? toDate(minDate) : undefined}
          endMonth={maxDate?.trim() ? toDate(maxDate) : undefined}
          defaultMonth={
            (value?.from?.trim() ? toDate(value.from) : undefined) ??
            (minDate?.trim() ? toDate(minDate) : undefined)
          }
          numberOfMonths={2}
          className="rounded-lg border-0"
        />
      </PopoverContent>
    </Popover>
  );
}
