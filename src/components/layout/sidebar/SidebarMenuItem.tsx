
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarMenuSub,
} from "@/components/ui/sidebar";
import { SidebarSubMenuItem } from "./SidebarSubMenuItem";
import { MenuItem } from "./SidebarMenuData";

interface SidebarMenuItemProps {
  item: MenuItem;
  openSections: Record<string, boolean>;
  toggleSection: (title: string) => void;
}

export const SidebarMenuItemComponent: React.FC<SidebarMenuItemProps> = ({ 
  item, 
  openSections, 
  toggleSection 
}) => {
  const location = useLocation();

  // Check if this path is active or a parent of the current path
  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  const isActive = isActivePath(item.path);

  // Handle click event to ensure proper propagation
  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleSection(item.title);
    console.log(`Toggling section: ${item.title}, isActive: ${isActive}`);
  };

  // If this menu item has no submenu items
  if (!item.subItems) {
    return (
      <SidebarMenuItem>
        <SidebarMenuButton asChild>
          <Link 
            to={item.path} 
            className={`flex items-center gap-3 ${isActive ? 'font-medium text-primary' : ''}`}
            onClick={() => console.log(`Navigating to ${item.path}`)}
          >
            <item.icon className="h-5 w-5" />
            <span>{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    );
  }

  // For menu items with submenus
  return (
    <SidebarMenuItem>
      <Collapsible 
        open={openSections[item.title] || isActive} 
        onOpenChange={() => toggleSection(item.title)}
      >
        <CollapsibleTrigger asChild>
          <SidebarMenuButton 
            className={`w-full justify-between ${isActive ? 'font-medium text-primary' : ''}`}
            onClick={handleToggleClick}
          >
            <div className="flex items-center gap-3">
              <item.icon className="h-5 w-5" />
              <span>{item.title}</span>
            </div>
            <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSections[item.title] ? 'rotate-180' : ''}`} />
          </SidebarMenuButton>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <SidebarMenuSub>
            {item.subItems.map((subItem) => (
              <SidebarSubMenuItem
                key={subItem.title}
                subItem={subItem}
                isActive={isActivePath(subItem.path)}
                isOpen={openSections[subItem.title] || false}
                toggleSection={toggleSection}
              />
            ))}
          </SidebarMenuSub>
        </CollapsibleContent>
      </Collapsible>
    </SidebarMenuItem>
  );
};
