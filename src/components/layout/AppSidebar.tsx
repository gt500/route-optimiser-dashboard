
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
  Wrench,
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
        path: "/reports/delivery/daily",
        subItems: [
          { title: "Daily Reports", path: "/reports/delivery/daily" },
          { title: "Weekly Reports", path: "/reports/delivery/weekly" },
          { title: "Monthly Reports", path: "/reports/delivery/monthly" },
        ]
      },
      {
        title: "Maintenance Reports",
        path: "/reports/maintenance/schedule",
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
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

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
          <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center">
            <Truck className="text-white h-5 w-5" />
          </div>
          <span className="font-semibold text-xl">RouteOptima</span>
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
                          <ChevronDown className="h-4 w-4 transition-transform duration-200" />
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem) => (
                            <React.Fragment key={subItem.title}>
                              <SidebarMenuSubItem>
                                <Collapsible 
                                  open={openSections[subItem.title] || isActivePath(subItem.path)} 
                                  onOpenChange={() => toggleSection(subItem.title)}
                                >
                                  <CollapsibleTrigger asChild>
                                    <SidebarMenuSubButton 
                                      className={`w-full justify-between ${isActivePath(subItem.path) ? 'font-medium text-primary' : ''}`}
                                    >
                                      <span>{subItem.title}</span>
                                      {subItem.subItems && <ChevronRight className="h-4 w-4 transition-transform duration-200" />}
                                    </SidebarMenuSubButton>
                                  </CollapsibleTrigger>
                                  {subItem.subItems && (
                                    <CollapsibleContent>
                                      <SidebarMenuSub>
                                        {subItem.subItems.map((nestedItem) => (
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
                                  )}
                                </Collapsible>
                              </SidebarMenuSubItem>
                            </React.Fragment>
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
