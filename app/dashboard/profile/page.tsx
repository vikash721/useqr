"use client";

import { useUser } from "@clerk/nextjs";
import {
  Calendar,
  Camera,
  Loader2,
  Mail,
  Shield,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRef, useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { usersApi } from "@/lib/api";
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
