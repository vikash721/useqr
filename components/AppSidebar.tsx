"use client";

import { useState } from "react";
import {
  Bot,
  BookOpen,
  ChevronDown,
  ChevronsUpDown,
  Layers,
  Monitor,
  Settings,
} from "lucide-react";
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

export function AppSidebar() {
  const [playgroundOpen, setPlaygroundOpen] = useState(true);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b border-sidebar-border transition-colors duration-300">
        <div className="flex items-center gap-3 rounded-lg p-2 transition-[padding] duration-300 ease-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-md bg-blue-600 text-white transition-[border-radius] duration-300 ease-out group-data-[collapsible=icon]:size-8">
            <Layers className="size-5 transition-[transform] duration-300 group-data-[collapsible=icon]:size-4" />
          </div>
          <div className="flex flex-1 flex-col gap-0.5 overflow-hidden transition-opacity duration-300 ease-out group-data-[collapsible=icon]:hidden">
            <span className="truncate text-sm font-medium text-sidebar-foreground">
              Acme Inc
            </span>
            <span className="truncate text-xs text-muted-foreground">
              Enterprise
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
            <div className="flex w-full items-center gap-3 rounded-lg p-2 transition-[padding] duration-300 ease-out group-data-[collapsible=icon]:justify-center group-data-[collapsible=icon]:p-2">
              <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-sidebar-accent text-sm font-medium text-sidebar-accent-foreground transition-[transform] duration-300 ease-out group-data-[collapsible=icon]:size-8">
                S
              </div>
              <div className="flex flex-1 flex-col gap-0.5 overflow-hidden transition-opacity duration-300 ease-out group-data-[collapsible=icon]:hidden">
                <span className="truncate text-sm font-medium text-sidebar-foreground">
                  shadcn
                </span>
                <span className="truncate text-xs text-muted-foreground">
                  m@example.com
                </span>
              </div>
              <button
                type="button"
                className="flex size-8 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:hidden"
                aria-label="Account menu"
              >
                <ChevronsUpDown className="size-4" />
              </button>
            </div>
          </TooltipTrigger>
          <TooltipContent side="right">
            <span className="font-medium">shadcn</span>
            <span className="block text-xs text-muted-foreground">
              m@example.com
            </span>
          </TooltipContent>
        </Tooltip>
      </SidebarFooter>
    </Sidebar>
  );
}
