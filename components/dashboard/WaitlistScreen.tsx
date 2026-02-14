"use client";

import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Loader2,
  QrCode,
  Sparkles,
  Users,
} from "lucide-react";
import { AnimatedCheckCircle } from "./AnimatedCheckCircle";
import { usersApi, type WaitlistUser } from "@/lib/api";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

// WaitlistUser type imported from @/lib/api

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .map((s) => s[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}


function formatJoined(iso: string): string {
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  } catch {
    return "—";
  }
}

const COMING_SOON = [
  {
    icon: QrCode,
    title: "QR management",
    description: "Create, edit, and organize your reusable QR codes in one place.",
  },
  {
    icon: BarChart3,
    title: "Scan analytics",
    description: "See when and where your codes are scanned.",
  },
  {
    icon: Sparkles,
    title: "Smart content",
    description: "Links, video, contact cards—update anytime, one code forever.",
  },
];

export function WaitlistScreen() {
  const [users, setUsers] = useState<WaitlistUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const refetchDone = useRef(false);

  useEffect(() => {
    let cancelled = false;

    usersApi
      .getAll()
      .then((list) => {
        if (cancelled) return;
        setUsers(Array.isArray(list) ? list : []);
        setError(null);
      })
      .catch((err) => {
        if (cancelled) return;
        setUsers([]);
        setError(err?.response?.data?.error ?? "Failed to load waitlist.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // Refetch once after a short delay so new signups (synced by UserSyncOnMount) appear in the list
  useEffect(() => {
    if (!loading && !refetchDone.current) {
      refetchDone.current = true;
      const t = setTimeout(() => {
        usersApi.getAll().then((list) => {
          setUsers(Array.isArray(list) ? list : []);
        }).catch(() => {});
      }, 1500);
      return () => clearTimeout(t);
    }
  }, [loading]);

  return (
    <div className="flex flex-1 flex-col">
      <div className="mx-auto w-full max-w-3xl flex-1 px-4 py-10 sm:px-6 lg:px-8">
        {/* Hero */}
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex size-14 items-center justify-center rounded-lg border border-border bg-card">
            {loading ? (
              <Loader2 className="size-7 animate-spin text-muted-foreground" aria-hidden />
            ) : (
              <AnimatedCheckCircle />
            )}
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            {loading ? "Checking your status…" : "You're on the waitlist"}
          </h1>
          <p className="mt-2 max-w-md text-sm text-muted-foreground sm:text-base">
            {loading
              ? "Fetching your waitlist details."
              : "We're building the full dashboard. You'll be first to know when it's ready."}
          </p>
        </div>

        {/* Status card */}
        <div
          className={cn(
            "mt-8 rounded-lg border border-border bg-card p-6 shadow-sm",
            "ring-1 ring-border/50"
          )}
        >
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0 flex-1">
              {loading ? (
                <>
                  <Skeleton className="h-4 w-24 rounded-md" />
                  <Skeleton className="mt-2 h-4 w-full max-w-sm rounded-md" />
                  <Skeleton className="mt-1.5 h-4 w-3/4 max-w-xs rounded-md" />
                </>
              ) : (
                <>
                  <h2 className="text-sm font-medium text-foreground">
                    Early access
                  </h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Your account is in. We&apos;ll email you when the full experience is live—no action needed.
                  </p>
                </>
              )}
            </div>
            <div className="shrink-0">
              {loading ? (
                <Skeleton className="h-8 w-24 rounded-md" />
              ) : (
                <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs font-medium text-emerald-400">
                  Confirmed
                </span>
              )}
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-border" />

        {/* What's coming */}
        <div>
          <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            What&apos;s coming
          </h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            {COMING_SOON.map((item) => {
              const Icon = item.icon;
              return (
                <div
                  key={item.title}
                  className={cn(
                    "rounded-lg border border-border bg-card p-5 shadow-sm",
                    "transition-colors hover:border-border/80 hover:bg-card/95"
                  )}
                >
                  <div className="flex size-10 items-center justify-center rounded-lg border border-border bg-muted/50 text-muted-foreground">
                    <Icon className="size-5" aria-hidden />
                  </div>
                  <h3 className="mt-3 text-sm font-medium text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1.5 text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Waitlist table */}
        <div className="mt-10">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground">
              <Users className="size-4" aria-hidden />
            </div>
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Waitlist
            </h2>
          </div>
          <div
            className={cn(
              "mt-4 overflow-hidden rounded-lg border border-border bg-card shadow-sm",
              "ring-1 ring-border/50"
            )}
          >
            <div className="overflow-x-auto">
              <table className="w-full min-w-[520px] text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="w-12 px-4 py-3 font-medium text-muted-foreground">
                      {/* Profile */}
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Name
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Email
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Joined
                    </th>
                    <th className="px-4 py-3 font-medium text-muted-foreground">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {loading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i} className={i % 2 === 0 ? "bg-card" : "bg-muted/5"}>
                        <td className="px-4 py-3">
                          <Skeleton className="size-9 shrink-0 rounded-full bg-muted/50" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-24 rounded-md bg-muted/50" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-32 rounded-md bg-muted/50" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-4 w-20 rounded-md bg-muted/50" />
                        </td>
                        <td className="px-4 py-3">
                          <Skeleton className="h-5 w-16 rounded-md bg-muted/50" />
                        </td>
                      </tr>
                    ))
                  ) : error ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        {error}
                      </td>
                    </tr>
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-8 text-center text-sm text-muted-foreground">
                        No users on the waitlist yet.
                      </td>
                    </tr>
                  ) : (
                    users.map((row, i) => (
                      <tr
                        key={row.id}
                        className={cn(
                          "transition-colors hover:bg-muted/20",
                          i % 2 === 0 ? "bg-card" : "bg-muted/5"
                        )}
                      >
                        <td className="px-4 py-3">
                          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-muted/50">
                            {row.imageUrl ? (
                              <img
                                src={row.imageUrl}
                                alt="Waitlist user avatar"
                                className="size-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-medium text-muted-foreground">
                                {getInitials(row.name ?? "?")}
                              </span>
                            )}
                          </div>
                        </td>
                        <td className="px-4 py-3 font-medium text-foreground">
                          {row.name ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {row.email ?? "—"}
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">
                          {formatJoined(row.createdAt)}
                        </td>
                        <td className="px-4 py-3">
                          <span className="inline-flex items-center rounded-md border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-400">
                            Confirmed
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
          <p className="mt-3 text-xs text-muted-foreground">
            {loading ? "Loading…" : `${users.length} people on the waitlist. You'll be notified when the full dashboard is live.`}
          </p>
        </div>
      </div>
    </div>
  );
}
