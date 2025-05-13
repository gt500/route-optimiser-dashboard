
import React, { useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar
} from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarNavigation } from "./sidebar/SidebarNavigation";

export function AppSidebar() {
  console.log("Rendering AppSidebar");
  const { openMobile, isMobile } = useSidebar();
  
  // Automatically open sidebar on initial load for desktop
  useEffect(() => {
    console.log("AppSidebar mounted, isMobile:", isMobile);
    // This is just for debugging purposes
  }, [isMobile]);
  
  return (
    <Sidebar>
      <AppSidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarNavigation />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
