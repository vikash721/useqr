"use client";

import { useState } from "react";
import { useClerk } from "@clerk/nextjs";
import {
  Bot,
  BookOpen,
  ChevronDown,
  ChevronsUpDown,
  LogOut,
  Monitor,
  Settings,
} from "lucide-react";
import Image from "next/image";
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
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar";
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

export function AppSidebar() {
  const [playgroundOpen, setPlaygroundOpen] = useState(true);
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
          <div className="flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-md p-1.5 transition-[border-radius] duration-300 ease-out group-data-[collapsible=icon]:size-8 group-data-[collapsible=icon]:p-1">
            <Image
              src="/logo/svg/logo.svg"
              alt="UseQR"
              width={36}
              height={36}
              className="size-full object-contain transition-transform duration-300"
            />
          </div>
          <div className="flex flex-1 items-center overflow-hidden transition-opacity duration-300 ease-out group-data-[collapsible=icon]:hidden">
            <span className="truncate text-xl font-semibold tracking-tight text-sidebar-foreground">
              Use<span className="text-emerald-500">QR</span>
            </span>
          </div>
          <button
            type="button"
            className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
            aria-label="Switch organization"
          >
            <ChevronsUpDown className="size-4" />
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel className="transition-opacity duration-300 group-data-[collapsible=icon]:opacity-0">
            Platform
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => setPlaygroundOpen((o) => !o)}
                  className="flex items-center justify-between transition-colors duration-200"
                  tooltip="Playground"
                >
                  <span className="flex items-center gap-2">
                    <Monitor className="size-4 shrink-0" />
                    Playground
                  </span>
                  <ChevronDown
                    className="size-4 shrink-0 transition-transform duration-200 ease-out"
                    style={{
                      transform: playgroundOpen
                        ? "rotate(0deg)"
                        : "rotate(-90deg)",
                    }}
                  />
                </SidebarMenuButton>
                <div
                  className="grid transition-[grid-template-rows] duration-200 ease-out"
                  style={{
                    gridTemplateRows: playgroundOpen ? "1fr" : "0fr",
                  }}
                >
                  <div className="min-h-0 overflow-hidden">
                    <SidebarMenuSub className="opacity-100 transition-opacity duration-200 ease-out">
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          History
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">Starred</SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                      <SidebarMenuSubItem>
                        <SidebarMenuSubButton href="#">
                          Settings
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    </SidebarMenuSub>
                  </div>
                </div>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Models">
                  <a href="#">
                    <Bot className="size-4" />
                    Models
                    <ChevronDown className="ml-auto size-4 -rotate-90" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Documentation">
                  <a href="#">
                    <BookOpen className="size-4" />
                    Documentation
                    <ChevronDown className="ml-auto size-4 -rotate-90" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Settings">
                  <a href="#">
                    <Settings className="size-4" />
                    Settings
                    <ChevronDown className="ml-auto size-4 -rotate-90" />
                  </a>
                </SidebarMenuButton>
              </SidebarMenuItem>
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
                      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden text-left transition-opacity duration-300 ease-out group-data-[collapsible=icon]:hidden">
                        <span className="truncate text-sm font-medium text-sidebar-foreground">
                          {displayName}
                        </span>
                        <span className="truncate text-xs text-muted-foreground">
                          {email || "—"}
                        </span>
                      </div>
                      <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground group-data-[collapsible=icon]:hidden" />
                    </>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="right" align="end" className="w-56">
                <DropdownMenuItem onClick={handleSignOut}>
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
