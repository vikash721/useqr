"use client";

import { AppSidebar } from "@/components/AppSidebar";
import {
  SidebarInset,
  SidebarProvider,
} from "@/components/ui/sidebar";
import { useShouldShowSidebar } from "@/utils/sidebar";

interface ConditionalSidebarLayoutProps {
  children: React.ReactNode;
}

/**
 * Wraps children with the sidebar layout when the current route should show the sidebar.
 * Add paths to PATHS_WITHOUT_SIDEBAR in utils/sidebar.ts to hide the sidebar on specific pages.
 * SidebarProvider always wraps the tree so useSidebar() is available everywhere.
 */
export function ConditionalSidebarLayout({ children }: ConditionalSidebarLayoutProps) {
  const showSidebar = useShouldShowSidebar();

  return (
    <SidebarProvider>
      {showSidebar ? (
        <>
          <AppSidebar />
          <SidebarInset>{children}</SidebarInset>
        </>
      ) : (
        <div className="flex min-h-svh w-full flex-col">
          {children}
        </div>
      )}
    </SidebarProvider>
  );
}
