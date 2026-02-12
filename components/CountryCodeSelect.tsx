"use client";

import * as React from "react";
import { ChevronDown, Search } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import {
  COUNTRIES,
  countryToFlag,
  getCountryByDial,
  type CountryOption,
} from "@/lib/countries";

type CountryCodeSelectProps = {
  value: string;
  onValueChange: (dial: string) => void;
  className?: string;
  triggerClassName?: string;
};

export function CountryCodeSelect({
  value,
  onValueChange,
  className,
  triggerClassName,
}: CountryCodeSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const selected = getCountryByDial(value) ?? COUNTRIES[0];

  const filtered = React.useMemo(() => {
    if (!search.trim()) return COUNTRIES;
    const q = search.trim().toLowerCase();
    return COUNTRIES.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.dial.includes(q) ||
        c.code.toLowerCase().includes(q)
    );
  }, [search]);

  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (!o) setSearch(""); }}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn(
            "min-w-[120px] justify-between gap-2 border-border bg-background font-normal",
            triggerClassName
          )}
        >
          <span className="flex items-center gap-2 truncate">
            <span className="text-lg leading-none" aria-hidden>
              {countryToFlag(selected.code)}
            </span>
            <span className="truncate">{selected.dial}</span>
          </span>
          <ChevronDown className="size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className={cn("w-[280px] p-0", className)} align="start">
        <div className="border-b border-border p-2">
          <div className="relative">
            <Search className="absolute left-2.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search country..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 pl-8"
            />
          </div>
        </div>
        <ScrollArea className="h-[240px]">
          <div className="p-1">
            {filtered.length ? (
              filtered.map((country) => (
                <CountryItem
                  key={country.code}
                  country={country}
                  selected={selected.code === country.code}
                  onSelect={() => {
                    onValueChange(country.dial);
                    setOpen(false);
                  }}
                />
              ))
            ) : (
              <p className="py-4 text-center text-sm text-muted-foreground">
                No country found
              </p>
            )}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function CountryItem({
  country,
  selected,
  onSelect,
}: {
  country: CountryOption;
  selected: boolean;
  onSelect: () => void;
}) {
  const flag = countryToFlag(country.code);
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex w-full items-center gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent hover:text-accent-foreground",
        selected && "bg-accent text-accent-foreground"
      )}
    >
      <span className="text-xl leading-none" aria-hidden>
        {flag}
      </span>
      <span className="flex-1 truncate">{country.name}</span>
      <span className="text-muted-foreground">{country.dial}</span>
    </button>
  );
}
