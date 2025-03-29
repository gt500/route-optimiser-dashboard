
import React, { useState } from "react";
import {
  Sidebar,
  SidebarContent,
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
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Truck,
  MapPin,
  Settings,
  Map,
  BarChart,
  FileText,
  Calendar,
  Clock,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

const menuItems = [
  {
    title: "Dashboard",
    icon: LayoutDashboard,
    path: "/",
  },
  {
    title: "Routes",
    icon: Map,
    path: "/routes",
  },
  {
    title: "Locations",
    icon: MapPin,
    path: "/locations",
  },
  {
    title: "Fleet",
    icon: Truck,
    path: "/fleet",
  },
  {
    title: "Reports",
    icon: FileText,
    path: "/reports",
    subItems: [
      {
        title: "Delivery Reports",
        path: "/reports/delivery",
        isSubmenu: true,
        subItems: [
          { title: "Daily Reports", path: "/reports/delivery/daily" },
          { title: "Weekly Reports", path: "/reports/delivery/weekly" },
          { title: "Monthly Reports", path: "/reports/delivery/monthly" },
        ]
      },
      {
        title: "Maintenance Reports",
        path: "/reports/maintenance",
        isSubmenu: true,
        subItems: [
          { title: "Maintenance Schedule", path: "/reports/maintenance/schedule" },
        ]
      }
    ]
  },
  {
    title: "Analytics",
    icon: BarChart,
    path: "/analytics",
  },
  {
    title: "Settings",
    icon: Settings,
    path: "/settings",
  },
];

export function AppSidebar() {
  const location = useLocation();
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

  // Check if a path is the current path or a parent of the current path
  const isActivePath = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
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
                <SidebarMenuItem key={item.title}>
                  {!item.subItems ? (
                    <SidebarMenuButton asChild>
                      <Link 
                        to={item.path} 
                        className={`flex items-center gap-3 ${isActivePath(item.path) ? 'font-medium text-primary' : ''}`}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <Collapsible 
                      open={openSections[item.title] || isActivePath(item.path)} 
                      onOpenChange={() => toggleSection(item.title)}
                    >
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          className={`w-full justify-between ${isActivePath(item.path) ? 'font-medium text-primary' : ''}`}
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
                            <SidebarMenuSubItem key={subItem.title}>
                              {subItem.isSubmenu ? (
                                <Collapsible 
                                  open={openSections[subItem.title] || isActivePath(subItem.path)} 
                                  onOpenChange={() => toggleSection(subItem.title)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton 
                                      className={`w-full justify-between ${isActivePath(subItem.path) ? 'font-medium text-primary' : ''}`}
                                    >
                                      <span>{subItem.title}</span>
                                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${openSections[subItem.title] ? 'rotate-180' : ''}`} />
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  <CollapsibleContent>
                                    <SidebarMenuSub>
                                      {subItem.subItems && subItem.subItems.map((nestedItem) => (
                                        <SidebarMenuSubItem key={nestedItem.title}>
                                          <SidebarMenuSubButton 
                                            asChild 
                                            size="sm"
                                            className={isActivePath(nestedItem.path) ? 'font-medium text-primary' : ''}
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
                              ) : (
                                <SidebarMenuSubButton 
                                  asChild
                                  className={isActivePath(subItem.path) ? 'font-medium text-primary' : ''}
                                >
                                  <Link to={subItem.path}>
                                    <span>{subItem.title}</span>
                                  </Link>
                                </SidebarMenuSubButton>
                              )}
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
