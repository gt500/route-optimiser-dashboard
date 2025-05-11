
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
  Zap,
} from "lucide-react";

export type SubMenuItem = {
  title: string;
  path: string;
  isSubmenu?: boolean;
  subItems?: SubMenuItem[];
};

export type MenuItem = {
  title: string;
  icon: React.ComponentType<any>;
  path: string;
  subItems?: SubMenuItem[];
};

export const menuItems: MenuItem[] = [
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
    title: "Machine Triggers",
    icon: Zap,
    path: "/machine-triggers",
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
