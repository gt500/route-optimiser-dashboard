
import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Map, AlertTriangle } from 'lucide-react';
import { LocationType } from '../locations/LocationEditDialog';

interface RouteMapProps {
  route: {
    locations: LocationType[];
    distance: number;
    estimatedDuration?: number;
    trafficConditions?: 'light' | 'moderate' | 'heavy';
    usingRealTimeData?: boolean;
  } | null;
}

const RouteMap = ({ route }: RouteMapProps) => {
  const getTrafficColor = (condition?: string) => {
    switch (condition) {
      case 'light': return 'text-emerald-500';
      case 'moderate': return 'text-amber-500';
      case 'heavy': return 'text-red-500';
      default: return 'text-primary';
    }
  };

  const getPathClasses = (condition?: string) => {
    let baseClass = "text-primary route-path";
    
    if (!condition) return baseClass;
    
    switch (condition) {
      case 'light': return baseClass + " text-emerald-500";
      case 'moderate': return baseClass + " text-amber-500";
      case 'heavy': return baseClass + " text-red-500";
      default: return baseClass;
    }
  };
  
  return (
    <div className="h-[400px] bg-slate-100 dark:bg-slate-900 rounded-lg relative overflow-hidden border border-border shadow-sm">
      <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
        {route && route.locations.length > 0 ? (
          <div className="text-center space-y-3 w-full h-full">
            <div className="w-full h-full absolute">
              <svg className="w-full h-full" viewBox="0 0 800 400">
                {route.locations.length > 1 && (
                  <path 
                    d={generatePathFromLocations(route.locations)}
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="3" 
                    className={getPathClasses(route.trafficConditions)}
                  />
                )}
                
                {route.locations.map((location, i) => (
                  <circle 
                    key={i} 
                    cx={150 + (i * (500 / Math.max(1, route.locations.length - 1)))} 
                    cy={200 + (i % 2 === 0 ? -50 : 50)} 
                    r="8" 
                    className="fill-primary" 
                  />
                ))}
              </svg>
            </div>
            <div className="absolute bottom-4 right-4 z-10">
              <Card className="w-auto bg-background/90 backdrop-blur-sm shadow-md">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2 text-sm">
                    <span className="font-medium">Route:</span> 
                    <span className="text-muted-foreground">{route.distance} km</span>
                    <span className="text-muted-foreground">•</span>
                    <span className="text-muted-foreground">
                      {route.estimatedDuration || Math.round(route.distance * 1.5)} min
                    </span>
                    
                    {route.trafficConditions && (
                      <>
                        <span className="text-muted-foreground">•</span>
                        <span className={`flex items-center gap-1 ${getTrafficColor(route.trafficConditions)}`}>
                          {route.trafficConditions === 'heavy' && <AlertTriangle className="h-3 w-3" />}
                          {route.trafficConditions.charAt(0).toUpperCase() + route.trafficConditions.slice(1)} traffic
                        </span>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <div className="text-center space-y-3">
            <Map className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Map visualization will appear here</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">Select locations and define a route to see the optimized path</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Generate a path string for SVG based on locations
const generatePathFromLocations = (locations: LocationType[]): string => {
  if (locations.length < 2) return "";
  
  const points: string[] = [];
  const numPoints = locations.length;
  
  // Create a more natural looking path
  locations.forEach((_, index) => {
    const x = 150 + (index * (500 / Math.max(1, numPoints - 1)));
    const y = 200 + (index % 2 === 0 ? -50 : 50);
    
    if (index === 0) {
      points.push(`M${x},${y}`);
    } else {
      const prevX = 150 + ((index - 1) * (500 / Math.max(1, numPoints - 1)));
      const prevY = 200 + ((index - 1) % 2 === 0 ? -50 : 50);
      
      const cpx1 = prevX + (x - prevX) / 2;
      const cpy1 = prevY;
      const cpx2 = prevX + (x - prevX) / 2;
      const cpy2 = y;
      
      points.push(`C${cpx1},${cpy1} ${cpx2},${cpy2} ${x},${y}`);
    }
  });
  
  return points.join(' ');
};

export default RouteMap;
