
import React from "react";
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
import { Link } from "react-router-dom";
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
} from "lucide-react";

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
        subItems: [
          { title: "Daily Reports", path: "/reports/delivery/daily" },
          { title: "Weekly Reports", path: "/reports/delivery/weekly" },
          { title: "Monthly Reports", path: "/reports/delivery/monthly" },
        ]
      },
      {
        title: "Maintenance Reports",
        path: "/reports/maintenance",
        subItems: [
          { title: "Maintenance Schedule", path: "/reports/maintenance/schedule" },
          { title: "Fleet Management", path: "/reports/maintenance/fleet" },
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
                      <Link to={item.path} className="flex items-center gap-3">
                        <item.icon className="h-5 w-5" />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  ) : (
                    <>
                      <SidebarMenuButton asChild>
                        <Link to={item.path} className="flex items-center gap-3">
                          <item.icon className="h-5 w-5" />
                          <span>{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                      <SidebarMenuSub>
                        {item.subItems.map((subItem) => (
                          <React.Fragment key={subItem.title}>
                            <SidebarMenuSubItem>
                              <SidebarMenuSubButton asChild>
                                <Link to={subItem.path}>
                                  <span>{subItem.title}</span>
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                            {subItem.subItems && (
                              <SidebarMenuSub>
                                {subItem.subItems.map((nestedItem) => (
                                  <SidebarMenuSubItem key={nestedItem.title}>
                                    <SidebarMenuSubButton asChild size="sm">
                                      <Link to={nestedItem.path}>
                                        <span>{nestedItem.title}</span>
                                      </Link>
                                    </SidebarMenuSubButton>
                                  </SidebarMenuSubItem>
                                ))}
                              </SidebarMenuSub>
                            )}
                          </React.Fragment>
                        ))}
                      </SidebarMenuSub>
                    </>
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
