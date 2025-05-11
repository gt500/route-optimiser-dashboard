
import React from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { 
  SidebarMenuSubItem, 
  SidebarMenuSubButton,
  SidebarMenuSub 
} from "@/components/ui/sidebar";
import { SubMenuItem } from "./SidebarMenuData";

interface SidebarSubMenuItemProps {
  subItem: SubMenuItem;
  isActive: boolean;
  isOpen: boolean;
  toggleSection: (title: string) => void;
}

export const SidebarSubMenuItem: React.FC<SidebarSubMenuItemProps> = ({ 
  subItem, 
  isActive, 
  isOpen,
  toggleSection 
}) => {
  const location = useLocation();

  // Check if this path is active
  const isSubItemActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  // Handle nested submenu rendering
  if (subItem.isSubmenu) {
    return (
      <SidebarMenuSubItem key={subItem.title}>
        <Collapsible 
          open={isOpen || isActive} 
          onOpenChange={() => toggleSection(subItem.title)}
        >
          <CollapsibleTrigger asChild>
            <SidebarMenuSubButton 
              className={`w-full justify-between ${isActive ? 'font-medium text-primary' : ''}`}
            >
              <span>{subItem.title}</span>
              <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </SidebarMenuSubButton>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <SidebarMenuSub>
              {subItem.subItems && subItem.subItems.map((nestedItem) => (
                <SidebarMenuSubItem key={nestedItem.title}>
                  <SidebarMenuSubButton 
                    asChild 
                    size="sm"
                    className={isSubItemActive(nestedItem.path) ? 'font-medium text-primary' : ''}
                  >
                    <Link to={nestedItem.path}>
                      <span>{nestedItem.title}</span>
                    </Link>
                  </SidebarMenuSubButton>
                </SidebarMenuSubItem>
              ))}
            </SidebarMenuSub>
          </CollapsibleContent>
        </Collapsible>
      </SidebarMenuSubItem>
    );
  }

  // Render regular submenu item
  return (
    <SidebarMenuSubItem key={subItem.title}>
      <SidebarMenuSubButton 
        asChild
        className={isSubItemActive(subItem.path) ? 'font-medium text-primary' : ''}
      >
        <Link to={subItem.path}>
          <span>{subItem.title}</span>
        </Link>
      </SidebarMenuSubButton>
    </SidebarMenuSubItem>
  );
};
