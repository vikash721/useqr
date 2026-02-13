"use client";

import { useClerk } from "@clerk/nextjs";
import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  ChevronsUpDown,
  CreditCard,
  Crown,
  LayoutDashboard,
  LogOut,
  Package,
  PencilRuler,
  QrCode,
  Sparkles,
  User,
} from "lucide-react";
import Link from "next/link";
import { useRef } from "react";
import { AnimatedLogo, type AnimatedLogoHandle } from "@/components/AnimatedLogo";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
} from "@/components/ui/sidebar";
import {
  AnimatedSidebarIcon,
  SidebarNavItem,
} from "@/components/AnimatedSidebarIcon";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/stores/useUserStore";

type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  premium?: boolean;
};

const SIDEBAR_GROUPS: { label: string; items: NavItem[] }[] = [
  {
    label: "Overview",
    items: [
      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    ],
  },
  {
    label: "QR codes",
    items: [
      { label: "My QRs", href: "/dashboard/my-qrs", icon: QrCode },
      { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3, premium: true },
    ],
  },
  {
    label: "Tools",
    items: [
      { label: "Design QR", href: "/dashboard/designs", icon: PencilRuler },
      { label: "My Orders", href: "/dashboard/my-orders", icon: Package },
    ],
  },
  {
    label: "Account",
    items: [
      { label: "Pricing", href: "/dashboard/pricing", icon: CreditCard },
      { label: "Profile", href: "/dashboard/profile", icon: User },
    ],
  },
];

export function AppSidebar() {
  const logoRef = useRef<AnimatedLogoHandle>(null);
  const user = useUserStore((s) => s.user);
  const clearUser = useUserStore((s) => s.clearUser);
  const { signOut } = useClerk();

  const isLoadingUser = user === null;
  const displayName = user?.name?.trim() || "User";
  const email = user?.email ?? "";
  const initial = (displayName[0] ?? "U").toUpperCase();
  const avatarUrl = user?.imageUrl ?? null;
  const plan = user?.plan?.toLowerCase() ?? "free";
  const hasPaidPlan = plan === "starter" || plan === "pro" || plan === "business";
  const planLabel =
    plan === "starter"
      ? "Starter"
      : plan === "pro"
        ? "Pro"
        : plan === "business"
          ? "Business"
          : null;

  const avatarPlanGlow =
    plan === "starter"
      ? "shadow-[0_0_10px_3px_rgba(59,130,246,0.42)]"
      : plan === "pro"
        ? "shadow-[0_0_10px_3px_rgba(16,185,129,0.42)]"
        : plan === "business"
          ? "shadow-[0_0_10px_3px_rgba(251,191,36,0.45)]"
          : "";

  const handleSignOut = async () => {
    clearUser();
    await signOut({ redirectUrl: "/" });
  };

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border transition-colors duration-300">
        <div className="flex items-center gap-1 rounded-lg p-2 transition-[padding] duration-300 ease-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
          <Link
            href="/dashboard"
            className="cursor-pointer flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md p-1.5 transition-[border-radius] duration-300 ease-out group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-1 hover:opacity-90"
            aria-label="UseQR home"
          >
            <AnimatedLogo ref={logoRef} />
          </Link>
          <Link
            href="/dashboard"
            className="flex flex-1 items-center overflow-hidden transition-opacity duration-300 ease-out group-data-[collapsible=icon]:hidden"
            onMouseEnter={() => logoRef.current?.replay()}
          >
            <span className="truncate text-xl font-semibold tracking-tight text-sidebar-foreground">
              Use<span className="text-emerald-500">QR</span>
            </span>
          </Link>
          <span className="size-8 shrink-0 group-data-[collapsible=icon]:hidden" aria-hidden />
        </div>
      </SidebarHeader>

      <SidebarContent>
        {SIDEBAR_GROUPS.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className="transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const tooltipLabel = item.premium ? `${item.label} (Premium)` : item.label;
                  return (
                    <SidebarNavItem key={item.label}>
                      {({ isHovered }) => (
                        <SidebarMenuButton asChild tooltip={tooltipLabel}>
                          <Link href={item.href} className="flex items-center gap-2">
                            <AnimatedSidebarIcon
                              icon={Icon}
                              isHovered={isHovered}
                            />
                            <span className="flex flex-1 items-center gap-1.5 truncate">
                              {item.label}
                              {item.premium && (
                                <span
                                  className="flex shrink-0 items-center rounded-md border border-amber-500/40 bg-linear-to-r from-amber-500/15 via-yellow-400/10 to-amber-500/15 px-1.5 py-0.5 group-data-[collapsible=icon]:hidden"
                                  title="Premium"
                                >
                                  <Crown className="size-3 text-amber-500 dark:text-amber-400" />
                                </span>
                              )}
                            </span>
                          </Link>
                        </SidebarMenuButton>
                      )}
                    </SidebarNavItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border transition-colors duration-300">
        <Tooltip>
          <TooltipTrigger asChild>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className="flex w-full items-center gap-3 rounded-lg p-2 transition-[padding] duration-300 ease-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2 hover:bg-sidebar-accent disabled:pointer-events-none disabled:opacity-100"
                  aria-label={isLoadingUser ? "Loading account" : "Account menu"}
                  disabled={isLoadingUser}
                >
                  {isLoadingUser ? (
                    <>
                      <Skeleton className="size-9 shrink-0 rounded-full bg-sidebar-accent transition-[transform] duration-300 ease-out group-data-[collapsible=icon]:size-8" />
                      <div className="flex flex-1 flex-col gap-1.5 overflow-hidden text-left transition-opacity duration-300 ease-out group-data-[collapsible=icon]:hidden">
                        <Skeleton className="h-4 w-24 rounded-md bg-sidebar-accent" />
                        <Skeleton className="h-3 w-32 rounded-md bg-sidebar-accent" />
                      </div>
                      <Skeleton className="size-4 shrink-0 rounded-sm bg-sidebar-accent group-data-[collapsible=icon]:hidden" />
                    </>
                  ) : avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt=""
                      className={`size-9 shrink-0 rounded-full object-cover transition-[transform] duration-300 ease-out group-data-[collapsible=icon]:size-8 ${avatarPlanGlow}`}
                    />
                  ) : (
                    <div
                      className={`flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground transition-[transform] duration-300 ease-out group-data-[collapsible=icon]:size-8 ${avatarPlanGlow}`}
                    >
                      {initial}
                    </div>
                  )}
                  {!isLoadingUser && (
                    <>
                      <div className="cursor-pointer flex flex-1 flex-col gap-0.5 overflow-hidden text-left transition-opacity duration-300 ease-out group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-sm font-medium text-sidebar-foreground">
                          {displayName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {email || "—"}
                        </span>
                      </div>
                      <ChevronsUpDown className="cursor-pointer size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                {hasPaidPlan && planLabel ? (
                  <DropdownMenuItem asChild className="cursor-pointer">
                    <Link
                      href="/dashboard/profile"
                      className="flex items-center gap-2 rounded-md  py-2 text-amber-600 dark:text-amber-400"
                    >
                      <Crown className="size-4 shrink-0" />
                      <span className="font-medium">{planLabel} · current</span>
                    </Link>
                  </DropdownMenuItem>
                ) : (
                  <DropdownMenuItem asChild className="cursor-pointer p-0">
                    <Link
                      href="/dashboard/pricing"
                      className="flex items-center gap-2 rounded-md bg-linear-to-r from-emerald-500 to-emerald-600 px-3 py-2.5 text-sm font-semibold text-white shadow-sm transition-opacity hover:opacity-95"
                    >
                      <Sparkles className="size-4 shrink-0" />
                      Upgrade
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="cursor-pointer">
                  <Link href="/dashboard/profile">
                    <User className="mr-2 size-4" />
                    Profile
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem className="cursor-pointer" onClick={handleSignOut}>
                  <LogOut className="mr-2 size-4" />
                  Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span className="font-medium">{displayName}</span>
            <span className="block text-xs text-muted-foreground">
              {email || "—"}
            </span>
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
