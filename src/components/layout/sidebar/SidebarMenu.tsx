
import React from "react";
import { SidebarMenu } from "@/components/ui/sidebar";
import { SidebarMenuItemComponent } from "./SidebarMenuItem";
import { menuItems } from "./SidebarMenuData";

interface SidebarMenuListProps {
  openSections: Record<string, boolean>;
  toggleSection: (title: string) => void;
}

export const SidebarMenuList: React.FC<SidebarMenuListProps> = ({ 
  openSections, 
  toggleSection 
}) => {
  return (
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
  );
};
