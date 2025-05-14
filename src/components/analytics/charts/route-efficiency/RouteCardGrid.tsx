
import React from 'react';
import { Button } from '@/components/ui/button';
import { Route } from 'lucide-react';
import RouteMetricsCard from '@/components/routes/metrics/RouteMetricsCard';
import { routeLegendData, getColorClass } from '@/components/analytics/data/routeLegendData';

interface RouteCardGridProps {
  routesData: Record<string, any>;
  handleViewDetails: (route: {id: string; name: string; color: string}) => void;
  handleRouteCardClick: (route: {id: string; name: string; color: string}) => void;
}

export const RouteCardGrid: React.FC<RouteCardGridProps> = ({ 
  routesData, 
  handleViewDetails, 
  handleRouteCardClick 
}) => {
  return (
    <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {routeLegendData.map((route) => {
        const routeTypeData = routesData[route.name];
        const isRealData = !!routeTypeData;
        
        const routeMetrics = isRealData 
          ? {
              title: routeTypeData.routeId || route.id,
              value: routeTypeData.name || route.name,
              subtitle: (
                <div className="flex flex-col gap-1">
                  <span className="text-xs">
                    {`Distance: ${routeTypeData.distance?.toFixed(1) || '0'} km • Cylinders: ${routeTypeData.cylinders || '0'}`}
                  </span>
                  <div className="flex items-center gap-1 mt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(route);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRouteCardClick(route);
                      }}
                    >
                      AI Analysis
                    </Button>
                  </div>
                </div>
              )
            }
          : {
              title: route.id,
              value: route.name,
              subtitle: (
                <div className="flex flex-col gap-1">
                  <span className="text-xs">{route.description}</span>
                  <div className="flex items-center gap-1 mt-1">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleViewDetails(route);
                      }}
                    >
                      View Details
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      className="h-6 text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRouteCardClick(route);
                      }}
                    >
                      AI Analysis
                    </Button>
                  </div>
                </div>
              )
            };
            
        return (
          <RouteMetricsCard
            key={route.id}
            title={routeMetrics.title}
            value={routeMetrics.value}
            color={getColorClass(route.color)}
            icon={<Route className="h-4 w-4" />}
            subtitle={routeMetrics.subtitle}
            onClick={() => handleRouteCardClick(route)}
          />
        );
      })}
    </div>
  );
};
