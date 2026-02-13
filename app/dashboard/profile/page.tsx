"use client";

import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  Camera,
  CreditCard,
  Loader2,
  Mail,
  Shield,
  User,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { usersApi } from "@/lib/api";
import type { PaymentTransactionSummary, SubscriptionSummary } from "@/lib/api/users";
import { toast } from "@/lib/toast";
import { useUserStore } from "@/stores/useUserStore";
import { cn } from "@/lib/utils";

function formatPlan(plan: string) {
  const p = plan?.toLowerCase() ?? "free";
  if (p === "pro" || p === "business" || p === "starter")
    return p.charAt(0).toUpperCase() + p.slice(1);
  return "Free";
}

function formatDate(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "long",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatDateShort(iso?: string) {
  if (!iso) return "—";
  try {
    const d = new Date(iso);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  } catch {
    return "—";
  }
}

function formatAmount(cents: number, currencyCode: string) {
  const value = (cents / 100).toFixed(2);
  const symbol = currencyCode === "USD" ? "$" : currencyCode === "EUR" ? "€" : currencyCode === "GBP" ? "£" : "";
  return symbol ? `${symbol}${value}` : `${value} ${currencyCode}`;
}

export default function ProfilePage() {
  const { user: clerkUser, isLoaded: clerkLoaded } = useUser();
  const storeUser = useUserStore((s) => s.user);
  const setUser = useUserStore((s) => s.setUser);

  const [isEditingName, setIsEditingName] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [subscription, setSubscription] = useState<SubscriptionSummary | null | undefined>(undefined);
  const [transactions, setTransactions] = useState<PaymentTransactionSummary[]>([]);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const [canceling, setCanceling] = useState(false);
  const [removingCancel, setRemovingCancel] = useState(false);

  useEffect(() => {
    if (!storeUser?.clerkId) {
      setSubscriptionLoading(false);
      return;
    }
    usersApi
      .getSubscription()
      .then((data) => {
        setSubscription(data.subscription);
        setTransactions(data.transactions ?? []);
      })
      .catch(() => {
        setSubscription(null);
        setTransactions([]);
      })
      .finally(() => setSubscriptionLoading(false));
  }, [storeUser?.clerkId]);

  const handleCancelSubscription = async () => {
    setCanceling(true);
    try {
      const data = await usersApi.cancelSubscription();
      toast.success(data.message);
      setCancelDialogOpen(false);
      const updated = await usersApi.getSubscription();
      setSubscription(updated.subscription);
      if (data.alreadyScheduled !== true) {
        await usersApi.sync().then((d) => d?.ok && d.user && setUser({
          clerkId: d.user.clerkId,
          email: d.user.email ?? null,
          name: d.user.name ?? null,
          imageUrl: d.user.imageUrl ?? null,
          plan: d.user.plan,
          createdAt: d.user.createdAt,
        }));
      }
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err instanceof Error ? err.message : "Failed to cancel subscription");
      toast.error(message);
      const updated = await usersApi.getSubscription().catch(() => null);
      if (updated?.subscription) setSubscription(updated.subscription);
    } finally {
      setCanceling(false);
    }
  };

  const handleRemoveScheduledCancel = async () => {
    setRemovingCancel(true);
    try {
      const data = await usersApi.removeScheduledCancel();
      toast.success(data.message);
      const updated = await usersApi.getSubscription();
      setSubscription(updated.subscription);
    } catch (err: unknown) {
      const message =
        (err as { response?: { data?: { error?: string } } })?.response?.data?.error ??
        (err instanceof Error ? err.message : "Failed to remove cancellation");
      toast.error(message);
      const updated = await usersApi.getSubscription().catch(() => null);
      if (updated?.subscription) setSubscription(updated.subscription);
    } finally {
      setRemovingCancel(false);
    }
  };

  const isLoading = !clerkLoaded || storeUser === null;
  const displayName =
    storeUser?.name?.trim() ||
    [clerkUser?.firstName, clerkUser?.lastName].filter(Boolean).join(" ").trim() ||
    "—";
  const email = storeUser?.email ?? clerkUser?.primaryEmailAddress?.emailAddress ?? "—";
  const avatarUrl =
    storeUser?.imageUrl ?? clerkUser?.imageUrl ?? null;
  const initial = (
    displayName !== "—" ? displayName[0] : "?"
  ).toUpperCase();
  const plan = formatPlan(storeUser?.plan ?? "free");
  const memberSince = formatDate(storeUser?.createdAt);

  const startEditingName = () => {
    setFirstName(clerkUser?.firstName ?? "");
    setLastName(clerkUser?.lastName ?? "");
    setIsEditingName(true);
  };

  const cancelEditingName = () => {
    setIsEditingName(false);
    setFirstName("");
    setLastName("");
  };

  const saveName = async () => {
    if (!clerkUser) return;
    setSavingName(true);
    try {
      await clerkUser.update({ firstName: firstName.trim() || null, lastName: lastName.trim() || null });
      const data = await usersApi.sync();
      if (data?.ok && data.user) {
        setUser({
          clerkId: data.user.clerkId,
          email: data.user.email ?? null,
          name: data.user.name ?? null,
          imageUrl: data.user.imageUrl ?? null,
          plan: data.user.plan,
          createdAt: data.user.createdAt,
        });
        toast.success("Name updated");
        setIsEditingName(false);
      } else {
        toast.error("Failed to sync profile");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update name";
      toast.error(message);
    } finally {
      setSavingName(false);
    }
  };

  const handlePhotoChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !clerkUser) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file");
      return;
    }
    setUploadingPhoto(true);
    e.target.value = "";
    try {
      await clerkUser.setProfileImage({ file });
      const data = await usersApi.sync();
      if (data?.ok && data.user) {
        setUser({
          clerkId: data.user.clerkId,
          email: data.user.email ?? null,
          name: data.user.name ?? null,
          imageUrl: data.user.imageUrl ?? null,
          plan: data.user.plan,
          createdAt: data.user.createdAt,
        });
        toast.success("Photo updated");
      } else {
        toast.error("Failed to sync profile");
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Failed to update photo";
      toast.error(message);
    } finally {
      setUploadingPhoto(false);
    }
  };

  return (
    <>
      <DashboardHeader />

      <div className="flex flex-1 flex-col overflow-y-auto">
        <div className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-8">
            <h1 className="text-xl font-semibold tracking-tight text-foreground sm:text-2xl">
              Profile
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Your account details and membership.
            </p>
          </div>

          <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/50">
            <div className="flex flex-col items-center border-b border-border px-6 py-8 sm:flex-row sm:items-center sm:gap-6 sm:px-8">
              <div className="relative flex shrink-0 flex-col items-center">
                {uploadingPhoto ? (
                  <div
                    className="flex flex-col items-center gap-2"
                    aria-busy="true"
                    aria-label="Uploading photo"
                  >
                    <div className="relative flex size-20 items-center justify-center rounded-full border-2 border-dashed border-emerald-500/50 bg-emerald-500/5">
                      <span className="absolute inset-0 animate-[spin_2.5s_linear_infinite] rounded-full border-2 border-transparent border-t-emerald-400 border-r-emerald-400/50" />
                      <Loader2 className="relative size-8 animate-spin text-emerald-400" />
                    </div>
                    <span className="whitespace-nowrap text-xs font-medium text-muted-foreground animate-pulse">
                      Uploading…
                    </span>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isLoading}
                    className="relative shrink-0 rounded-full ring-2 ring-border transition-opacity hover:opacity-90 disabled:opacity-70"
                    aria-label="Change profile photo"
                  >
                    {isLoading ? (
                      <Skeleton className="size-20 rounded-full" />
                    ) : avatarUrl ? (
                      <img
                        src={avatarUrl}
                        alt=""
                        className="size-20 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex size-20 items-center justify-center rounded-full bg-muted text-2xl font-semibold text-muted-foreground">
                        {initial}
                      </div>
                    )}
                    <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/50 opacity-0 transition-opacity hover:opacity-100">
                      <Camera className="size-8 text-white" />
                    </div>
                  </button>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="sr-only"
                onChange={handlePhotoChange}
              />

              <div className="mt-4 flex flex-1 flex-col items-center sm:mt-0 sm:items-start sm:text-left">
                {isLoading ? (
                  <>
                    <Skeleton className="h-7 w-40 rounded-md" />
                    <Skeleton className="mt-2 h-4 w-56 rounded-md" />
                    <Skeleton className="mt-3 h-6 w-20 rounded-full" />
                  </>
                ) : isEditingName ? (
                  <div className="w-full max-w-xs space-y-3">
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="sr-only" htmlFor="profile-first-name">
                          First name
                        </label>
                        <Input
                          id="profile-first-name"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          placeholder="First name"
                          className="h-9 border-border bg-background text-foreground focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                        />
                      </div>
                      <div>
                        <label className="sr-only" htmlFor="profile-last-name">
                          Last name
                        </label>
                        <Input
                          id="profile-last-name"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          placeholder="Last name"
                          className="h-9 border-border bg-background text-foreground focus-visible:border-emerald-500/50 focus-visible:ring-emerald-500/25"
                        />
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        onClick={saveName}
                        disabled={savingName}
                        className="bg-emerald-500 hover:bg-emerald-600"
                      >
                        {savingName ? (
                          <Loader2 className="size-4 animate-spin" />
                        ) : (
                          "Save"
                        )}
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={cancelEditingName}
                        disabled={savingName}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2">
                      <h2 className="text-lg font-semibold tracking-tight text-foreground">
                        {displayName}
                      </h2>
                      {clerkUser && (
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={startEditingName}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          Edit
                        </Button>
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">{email}</p>
                    <span
                      className={cn(
                        "mt-3 inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                        plan === "Pro" &&
                          "bg-emerald-500/15 text-emerald-400 ring-1 ring-emerald-500/30",
                        plan === "Business" &&
                          "bg-amber-500/15 text-amber-400 ring-1 ring-amber-500/30",
                        plan === "Starter" &&
                          "bg-blue-500/15 text-blue-400 ring-1 ring-blue-500/30",
                        plan === "Free" &&
                          "bg-muted text-muted-foreground ring-1 ring-border"
                      )}
                    >
                      {plan}
                    </span>
                  </>
                )}
              </div>
            </div>

            <div className="divide-y divide-border">
              <DetailRow
                icon={User}
                label="Display name"
                value={isLoading ? null : displayName}
              />
              <DetailRow
                icon={Mail}
                label="Email"
                value={isLoading ? null : email}
              />
              <DetailRow
                icon={Shield}
                label="Plan"
                value={isLoading ? null : plan}
                suffix={
                  !isLoading && plan === "Free" ? (
                    <Link
                      href="/dashboard/pricing"
                      className="ml-1.5 text-xs font-medium text-emerald-500 transition-colors hover:text-emerald-400"
                    >
                      Upgrade?
                    </Link>
                  ) : undefined
                }
              />
              <DetailRow
                icon={Calendar}
                label="Member since"
                value={isLoading ? null : memberSince}
              />
            </div>
          </div>

          {/* Subscription & billing */}
          <div className="mt-8">
            <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
              Subscription & billing
            </h2>
            <div className="rounded-xl border border-border bg-card shadow-sm ring-1 ring-border/50">
              {subscriptionLoading || (!!storeUser?.clerkId && subscription === undefined) ? (
                <div className="flex items-center gap-4 px-6 py-8 sm:px-8">
                  <Skeleton className="h-9 w-9 rounded-lg" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-48 rounded" />
                    <Skeleton className="h-4 w-64 rounded" />
                  </div>
                </div>
              ) : subscription && subscription.status !== "canceled" ? (
                <div className="divide-y divide-border">
                  <div className="flex flex-col gap-2 px-6 py-4 sm:px-8 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-4">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                        <CreditCard className="size-4" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {formatPlan(subscription.plan)} plan
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {subscription.scheduledChangeEffectiveAt
                            ? `Auto cancel on ${formatDateShort(subscription.scheduledChangeEffectiveAt)}`
                            : subscription.currentPeriodEnd
                              ? `Renews on ${formatDateShort(subscription.currentPeriodEnd)}`
                              : "Active"}
                        </p>
                      </div>
                    </div>
                    {!subscription.scheduledChangeEffectiveAt ? (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-500/30 text-red-500 hover:bg-red-500/10 hover:text-red-400"
                        onClick={() => setCancelDialogOpen(true)}
                      >
                        <XCircle className="mr-1.5 size-4" />
                        Cancel subscription
                      </Button>
                    ) : (
                      <div className="flex flex-col items-start gap-2">
                        <span className="text-xs text-muted-foreground">
                          Cancellation scheduled · {formatDateShort(subscription.scheduledChangeEffectiveAt ?? undefined)}
                        </span>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 hover:text-emerald-500"
                          onClick={handleRemoveScheduledCancel}
                          disabled={removingCancel}
                        >
                          {removingCancel ? (
                            <Loader2 className="mr-1.5 size-4 animate-spin" />
                          ) : null}
                          Keep my subscription
                        </Button>
                      </div>
                    )}
                  </div>
                  {transactions.length > 0 && (
                    <div className="px-6 py-4 sm:px-8">
                      <p className="mb-3 text-xs font-medium text-muted-foreground">
                        Payment history
                      </p>
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full min-w-[320px] text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                                Date
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                                Amount
                              </th>
                              <th className="px-3 py-2 text-left font-medium text-muted-foreground">
                                Status
                              </th>
                            </tr>
                          </thead>
                          <tbody>
                            {transactions.map((t) => (
                              <tr key={t.transactionId} className="border-b border-border/50 last:border-0">
                                <td className="px-3 py-2 text-foreground">
                                  {formatDateShort(t.billedAt)}
                                </td>
                                <td className="px-3 py-2 font-medium text-foreground">
                                  {formatAmount(t.amount, t.currencyCode)}
                                </td>
                                <td className="px-3 py-2 capitalize text-muted-foreground">
                                  {t.status}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                <div className="flex items-center gap-4 px-6 py-6 sm:px-8">
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
                    <CreditCard className="size-4" />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {subscription?.status === "canceled"
                        ? "Subscription canceled"
                        : "No active subscription"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {subscription?.status === "canceled" && subscription?.canceledAt
                        ? `Canceled on ${formatDateShort(subscription.canceledAt)}. `
                        : ""}
                      Upgrade to get more QR codes and features.
                    </p>
                    <Link
                      href="/dashboard/pricing"
                      className="mt-2 inline-block text-sm font-medium text-emerald-500 hover:text-emerald-400"
                    >
                      View plans →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          <Dialog open={cancelDialogOpen} onOpenChange={setCancelDialogOpen}>
            <DialogContent className="border-border bg-card text-foreground">
              <DialogHeader>
                <DialogTitle>Cancel subscription</DialogTitle>
                <DialogDescription>
                  Your subscription will end at the end of your current billing period.
                  You&apos;ll keep access until then.
                </DialogDescription>
              </DialogHeader>
              <DialogFooter>
                <Button variant="outline" onClick={() => setCancelDialogOpen(false)} disabled={canceling}>
                  Keep subscription
                </Button>
                <Button
                  variant="destructive"
                  onClick={handleCancelSubscription}
                  disabled={canceling}
                >
                  {canceling ? <Loader2 className="size-4 animate-spin" /> : "Cancel at period end"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Name and photo are saved to your account and synced everywhere you
            sign in.
          </p>
        </div>
      </div>
    </>
  );
}

function DetailRow({
  icon: Icon,
  label,
  value,
  suffix,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | null;
  suffix?: React.ReactNode;
}) {
  return (
    <div className="flex items-center gap-4 px-6 py-4 sm:px-8">
      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-muted/60 text-muted-foreground">
        <Icon className="size-4" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-muted-foreground">{label}</p>
        {value === null ? (
          <Skeleton className="mt-1 h-4 w-32 rounded" />
        ) : (
          <p className="mt-0.5 flex flex-wrap items-center gap-0 text-sm font-medium text-foreground">
            {value}
            {suffix}
          </p>
        )}
      </div>
    </div>
  );
}
