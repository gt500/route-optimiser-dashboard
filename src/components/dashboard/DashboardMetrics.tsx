
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

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
      <Card>
        <CardHeader>
          <CardTitle>Total Vehicles</CardTitle>
          <CardDescription>Number of vehicles in your fleet</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {fleetData?.vehicles?.length || 0}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Maintenance Tasks</CardTitle>
          <CardDescription>Scheduled maintenance tasks</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {fleetData?.maintenanceItems?.length || 0}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Routes Optimized</CardTitle>
          <CardDescription>Number of routes optimized</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {routeOptimizationStats?.routesOptimized || 0}
            </div>
          )}
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Fuel Saved</CardTitle>
          <CardDescription>Estimated fuel saved</CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-8 w-20" />
          ) : (
            <div className="text-2xl font-bold">
              {routeOptimizationStats?.fuelSaved || 0} L
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardMetrics;
