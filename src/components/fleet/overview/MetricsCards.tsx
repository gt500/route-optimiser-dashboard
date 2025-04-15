
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Wrench, Activity } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { FleetPerformanceMetrics, MaintenanceItem } from '@/types/fleet';

interface MetricsCardsProps {
  maintenanceItems: MaintenanceItem[];
  performanceMetrics: FleetPerformanceMetrics;
}

const UpcomingMaintenanceCard: React.FC<{ maintenanceItems: MaintenanceItem[] }> = ({ maintenanceItems }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black/70 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white">Upcoming Maintenance</CardTitle>
          <CardDescription className="text-white/60">Next scheduled services</CardDescription>
        </div>
        <Wrench className="h-4 w-4 text-white/60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {maintenanceItems.slice(0, 3).map((item, i) => (
            <div key={i} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
              <div>
                <div className="font-medium">{item.vehicle}</div>
                <div className="text-sm text-white/60">{item.type}</div>
              </div>
              <div className="text-right">
                <div className="text-sm">{item.date}</div>
                <Badge 
                  variant="outline" 
                  className={
                    item.status === 'In Progress' 
                      ? 'bg-blue-50 text-blue-700 border-blue-200' 
                      : 'bg-amber-50 text-amber-700 border-amber-200'
                  }
                >
                  {item.status}
                </Badge>
                {item.notes && <div className="text-xs text-muted-foreground mt-1">{item.notes}</div>}
              </div>
            </div>
          ))}
          {maintenanceItems.length === 0 && (
            <div className="p-3 text-center text-white/60">
              No upcoming maintenance scheduled
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const PerformanceMetricsCard: React.FC<{ performanceMetrics: FleetPerformanceMetrics }> = ({ performanceMetrics }) => {
  return (
    <Card className="hover:shadow-md transition-shadow duration-300 bg-black/70 border-white/10">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <div>
          <CardTitle className="text-white">Fleet Performance</CardTitle>
          <CardDescription className="text-white/60">Efficiency and utilization metrics</CardDescription>
        </div>
        <Activity className="h-4 w-4 text-white/60" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Average Fuel Efficiency</div>
              <div className="text-sm font-medium">{performanceMetrics.fuelEfficiency.value} km/L</div>
            </div>
            <Progress 
              value={(performanceMetrics.fuelEfficiency.value / performanceMetrics.fuelEfficiency.target) * 100}
              className="h-2" 
            />
            <div className="text-xs text-white/60 mt-1">
              {performanceMetrics.fuelEfficiency.value} km/L (target: {performanceMetrics.fuelEfficiency.target} km/L)
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Fleet Utilization</div>
              <div className="text-sm font-medium">{performanceMetrics.fleetUtilization.value}%</div>
            </div>
            <Progress 
              value={performanceMetrics.fleetUtilization.value} 
              className="h-2" 
            />
            <div className="text-xs text-white/60 mt-1">
              {performanceMetrics.fleetUtilization.value}% (target: {performanceMetrics.fleetUtilization.target}%)
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">Maintenance Compliance</div>
              <div className="text-sm font-medium">{performanceMetrics.maintenanceCompliance.value}%</div>
            </div>
            <Progress 
              value={performanceMetrics.maintenanceCompliance.value} 
              className="h-2" 
            />
            <div className="text-xs text-white/60 mt-1">
              {performanceMetrics.maintenanceCompliance.value}% (target: {performanceMetrics.maintenanceCompliance.target}%)
            </div>
          </div>
          
          <div>
            <div className="flex items-center justify-between mb-1">
              <div className="text-sm font-medium">On-Time Deliveries</div>
              <div className="text-sm font-medium">{performanceMetrics.onTimeDeliveries.value}%</div>
            </div>
            <Progress 
              value={performanceMetrics.onTimeDeliveries.value} 
              className="h-2" 
            />
            <div className="text-xs text-white/60 mt-1">
              {performanceMetrics.onTimeDeliveries.value}% (target: {performanceMetrics.onTimeDeliveries.target}%)
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const MetricsCards: React.FC<MetricsCardsProps> = ({ maintenanceItems, performanceMetrics }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <UpcomingMaintenanceCard maintenanceItems={maintenanceItems} />
      <PerformanceMetricsCard performanceMetrics={performanceMetrics} />
    </div>
  );
};

export default MetricsCards;
