
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { TotalVehicles, MaintenanceTasks, RoutesOptimized, FuelSaved } from 'lucide-react';

interface DashboardMetricsProps { 
  isLoading: boolean; 
  fleetData: any;
  routeOptimizationStats: any;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  isLoading, 
  fleetData, 
  routeOptimizationStats 
}) => {
  return (
    <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-4">
      <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
        <CardHeader>
          <CardTitle className="text-white/90 flex justify-between items-center">
            Total Vehicles
            <TotalVehicles className="h-5 w-5 text-white/60" />
          </CardTitle>
          <CardDescription className="text-white/60">Number of vehicles in your fleet</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 bg-white/20" />
          ) : (
            <div className="text-2xl font-bold text-white">
              {fleetData?.vehicles?.length || 0}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
        <CardHeader>
          <CardTitle className="text-white/90 flex justify-between items-center">
            Maintenance Tasks
            <MaintenanceTasks className="h-5 w-5 text-white/60" />
          </CardTitle>
          <CardDescription className="text-white/60">Scheduled maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 bg-white/20" />
          ) : (
            <div className="text-2xl font-bold text-white">
              {fleetData?.maintenanceItems?.length || 0}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
        <CardHeader>
          <CardTitle className="text-white/90 flex justify-between items-center">
            Routes Optimized
            <RoutesOptimized className="h-5 w-5 text-white/60" />
          </CardTitle>
          <CardDescription className="text-white/60">Number of routes optimized</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 bg-white/20" />
          ) : (
            <div className="text-2xl font-bold text-white">
              {routeOptimizationStats?.routesOptimized || 0}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card className="hover:shadow-md transition-shadow duration-300 bg-black text-white">
        <CardHeader>
          <CardTitle className="text-white/90 flex justify-between items-center">
            Fuel Saved
            <FuelSaved className="h-5 w-5 text-white/60" />
          </CardTitle>
          <CardDescription className="text-white/60">Estimated fuel saved</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20 bg-white/20" />
          ) : (
            <div className="text-2xl font-bold text-white">
              {routeOptimizationStats?.fuelSaved || 0} L
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
