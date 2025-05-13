
import React from "react";
import { SidebarHeader, SidebarTrigger } from "@/components/ui/sidebar";
import { useSidebar } from "@/components/ui/sidebar";

export const AppSidebarHeader: React.FC = () => {
  const { toggleSidebar } = useSidebar();
  
  const handleToggle = () => {
    console.log("Sidebar header toggle clicked");
    toggleSidebar();
  };

  return (
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
      <SidebarTrigger 
        className="hidden md:flex" 
        onClick={handleToggle}
      />
    </SidebarHeader>
  );
};
