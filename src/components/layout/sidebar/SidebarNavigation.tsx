
import React, { useEffect, useState } from "react";
import { SidebarMenu } from "@/components/ui/sidebar";
import { SidebarMenuItemComponent } from "./SidebarMenuItem";
import { menuItems } from "./SidebarMenuData";
import { useLocation } from "react-router-dom";

export const SidebarNavigation: React.FC = () => {
  const location = useLocation();
  
  // Initialize with the Reports section open by default
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Reports: true, // Open reports section by default
    "Delivery Reports": true, // Open delivery reports subsection by default
  });

  // Update open sections based on current location
  useEffect(() => {
    const updateOpenSectionsBasedOnRoute = () => {
      // Deep clone current state
      const updatedSections = { ...openSections };
      
      // Check current path and open relevant sections
      menuItems.forEach(item => {
        // Open section if we're currently on or in a subpath of this item
        if (location.pathname.startsWith(item.path) && item.path !== '/') {
          updatedSections[item.title] = true;
          
          // Check submenus if they exist
          if (item.subItems) {
            item.subItems.forEach(subItem => {
              if (location.pathname.startsWith(subItem.path)) {
                updatedSections[subItem.title] = true;
                
                // Check nested submenus
                if (subItem.subItems) {
                  subItem.subItems.forEach(nestedItem => {
                    if (location.pathname === nestedItem.path) {
                      updatedSections[nestedItem.title] = true;
                    }
                  });
                }
              }
            });
          }
        }
      });
      
      setOpenSections(updatedSections);
    };
    
    // Update on initial render and when location changes
    updateOpenSectionsBasedOnRoute();
  }, [location.pathname]);

  const toggleSection = (title: string) => {
    console.log("Toggling section:", title);
    setOpenSections(prev => ({
      ...prev,
      [title]: !prev[title]
    }));
  };

  // Add console logging to help debug sidebar interactions
  useEffect(() => {
    console.log("Current open sections:", openSections);
    console.log("Current location:", location.pathname);
  }, [openSections, location.pathname]);

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
