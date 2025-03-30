
import React from 'react';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from './AppSidebar';
import { AppHeader } from './AppHeader';
import { Outlet, useLocation } from 'react-router-dom';

export function AppLayout() {
  const location = useLocation();
  
  // Determine if the current route is one where we want the map background
  const isMapBackgroundRoute = 
    location.pathname.includes('/routes') || 
    location.pathname.includes('/reports/delivery');
  
  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <div className="flex-1 flex flex-col">
          <AppHeader />
          <main className={`flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto ${isMapBackgroundRoute ? 'bg-transparent' : ''}`}>
            <Outlet />
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
