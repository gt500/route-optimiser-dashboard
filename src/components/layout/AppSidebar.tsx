
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { SidebarMenuItemComponent } from "./sidebar/SidebarMenuItem";
import { menuItems } from "./sidebar/SidebarMenuData";

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
      <SidebarHeader className="p-6 flex items-center">
        <div className="flex items-center gap-2">
          <img 
            src="/lovable-uploads/0efc8897-38bc-4f0e-939a-58f79b569c17.png" 
            alt="GAZ2GO" 
            className="w-8 h-8"
          />
          <span className="font-semibold text-xl">Route Optimiser</span>
        </div>
        <div className="flex-1" />
        <SidebarTrigger className="hidden md:flex" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItemComponent
                  key={item.title}
                  item={item}
                  openSections={openSections}
                  toggleSection={toggleSection}
                />
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
