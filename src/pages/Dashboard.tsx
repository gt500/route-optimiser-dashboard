
import React from 'react';
import { DashboardHeader } from '@/components/dashboard/dashboard-header';
import { DashboardShell } from '@/components/dashboard/dashboard-shell';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import DeliveryOverviewChart from '@/components/dashboard/DeliveryOverviewChart';
import RecentRoutes from '@/components/dashboard/RecentRoutes';
import UpcomingDeliveries from '@/components/dashboard/UpcomingDeliveries';
import { useDashboardData } from '@/hooks/dashboard/useDashboardData';

const Dashboard = () => {
  const { 
    isLoading, 
    fleetData, 
    routeOptimizationStats, 
    weeklyDeliveryData,
    recentRoutes,
    upcomingDeliveries
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
            <DeliveryOverviewChart 
              isLoading={isLoading} 
              weeklyDeliveryData={weeklyDeliveryData} 
            />
          </div>
        </div>
        
        <div className="space-y-6">
          <RecentRoutes routes={recentRoutes} />
          <UpcomingDeliveries deliveries={upcomingDeliveries} />
        </div>
      </div>
    </DashboardShell>
  );
};

export default Dashboard;
