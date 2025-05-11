
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
} from "@/components/ui/sidebar";
import { AppSidebarHeader } from "./sidebar/SidebarHeader";
import { SidebarMenuList } from "./sidebar/SidebarMenu";

export function AppSidebar() {
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Reports: true, // Open reports section by default
    "Delivery Reports": true, // Open delivery reports subsection by default
  });

  const toggleSection = (title: string) => {
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  return (
    <Sidebar>
      <AppSidebarHeader />
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenuList 
              openSections={openSections}
              toggleSection={toggleSection}
            />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
