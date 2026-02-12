"use client";

import { useClerk } from "@clerk/nextjs";
import {
  BarChart3,
  ChevronsUpDown,
  CreditCard,
  LayoutDashboard,
  LogOut,
  Package,
  PencilRuler,
  Plus,
  QrCode,
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserStore } from "@/stores/useUserStore";

const SIDEBAR_NAV = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My QRs", href: "/dashboard/my-qrs", icon: QrCode },
  { label: "Create QR", href: "/dashboard/create", icon: Plus },
  { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
  { label: "Design QR", href: "/dashboard/designs", icon: PencilRuler },
  { label: "My Orders", href: "/dashboard/my-orders", icon: Package },
  { label: "Pricing", href: "/dashboard/pricing", icon: CreditCard },
  { label: "Profile", href: "/dashboard/profile", icon: User },
] as const;

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
        <SidebarGroup>
          <SidebarGroupLabel className="transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
            App
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {SIDEBAR_NAV.map((item) => {
                const Icon = item.icon;
                return (
                  <SidebarNavItem key={item.label}>
                    {({ isHovered }) => (
                      <SidebarMenuButton asChild tooltip={item.label}>
                        <Link href={item.href}>
                          <AnimatedSidebarIcon
                            icon={Icon}
                            isHovered={isHovered}
                          />
                          {item.label}
                        </Link>
                      </SidebarMenuButton>
                    )}
                  </SidebarNavItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
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
                      className="size-9 shrink-0 rounded-full object-cover transition-[transform] duration-300 ease-out group-data-[collapsible=icon]:size-8"
                    />
                  ) : (
                    <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground transition-[transform] duration-300 ease-out group-data-[collapsible=icon]:size-8">
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
