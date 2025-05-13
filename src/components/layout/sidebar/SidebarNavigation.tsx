
import React, { useEffect, useState } from "react";
import { SidebarMenu } from "@/components/ui/sidebar";
import { SidebarMenuItemComponent } from "./SidebarMenuItem";
import { menuItems } from "./SidebarMenuData";

export const SidebarNavigation: React.FC = () => {
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

  // Add console logging to help debug sidebar interactions
  useEffect(() => {
    console.log("Current open sections:", openSections);
  }, [openSections]);

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
