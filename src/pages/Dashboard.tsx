
import React, { lazy, Suspense } from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import { Skeleton } from '@/components/ui/skeleton';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';

// Lazy load components that aren't needed immediately
const DeliveryOverviewChart = lazy(() => import('@/components/dashboard/DeliveryOverviewChart'));
const RecentRoutes = lazy(() => import('@/components/dashboard/RecentRoutes'));
const UpcomingDeliveries = lazy(() => import('@/components/dashboard/UpcomingDeliveries'));

// Loading component
const ComponentLoader = () => (
  <div className="space-y-4 w-full">
    <Skeleton className="h-[200px] w-full" />
  </div>
);

const Dashboard = () => {
  const { 
    isLoading, 
    fleetData, 
    routeOptimizationStats, 
    weeklyDeliveryData,
    recentRoutes
  } = useDashboardData();

  return (
    <DashboardShell>
      <DashboardHeader 
        heading="Dashboard" 
        text="Overview of your fleet operations."
        logo="/lovable-uploads/0b09ba82-e3f0-4fa1-ab8d-87f06fd9f31b.png"
      />
      
      <DashboardMetrics 
        isLoading={isLoading} 
        fleetData={fleetData} 
        routeOptimizationStats={routeOptimizationStats} 
      />
      
      <div className="grid gap-6 mt-6 grid-cols-1 lg:grid-cols-2">
        <div className="space-y-6">
          <div className="mt-6">
            <Suspense fallback={<ComponentLoader />}>
              <DeliveryOverviewChart 
                isLoading={isLoading} 
                weeklyDeliveryData={weeklyDeliveryData} 
              />
            </Suspense>
          </div>
        </div>
        
        <div className="space-y-6">
          <Suspense fallback={<ComponentLoader />}>
            <RecentRoutes routes={recentRoutes} />
          </Suspense>
          <Suspense fallback={<ComponentLoader />}>
            <UpcomingDeliveries />
          </Suspense>
        </div>
      </div>
    </DashboardShell>
  );
};

export default Dashboard;
