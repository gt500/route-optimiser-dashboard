
import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Truck } from 'lucide-react';
import { calculateCompleteRoute } from '@/utils/route/routeCalculation';
import { getTrafficColor, getCurrentTrafficCondition } from '@/utils/route/trafficUtils';

interface RouteMapProps {
  locations: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }[];
  className?: string;
  height?: string;
  showTraffic?: boolean;
  onRouteDataUpdate?: (
    distance: number, 
    duration: number,
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number; duration: number }[]
  ) => void;
  country?: string;
  region?: string;
  routeName?: string;
  showStopMetrics?: boolean;
}

const RouteMap: React.FC<RouteMapProps> = ({
  locations,
  className = '',
  height = '400px',
  showTraffic = false,
  onRouteDataUpdate,
  country,
  region,
  routeName,
  showStopMetrics = false
}) => {
  const mapRef = useRef(null);
  const isFirstRender = useRef(true);
  
  useEffect(() => {
    if (locations.length < 2 || !onRouteDataUpdate) return;
    
    // Calculate route data with Google Maps API (simulated here)
    const calculateRouteData = async () => {
      try {
        const waypoints = locations.map(loc => ({
          latitude: loc.latitude,
          longitude: loc.longitude
        }));
        
        const result = await calculateCompleteRoute(waypoints, routeName, region);
        
        console.log('Route calculation result:', result);
        
        // Pass the data back to the parent component
        onRouteDataUpdate(
          result.totalDistance,
          result.totalDuration,
          result.trafficConditions,
          undefined, // coordinates would go here in a real implementation
          result.segments
        );
      } catch (error) {
        console.error('Error calculating route:', error);
      }
    };
    
    // Only calculate route if we have valid locations
    if (!isFirstRender.current && locations.every(loc => loc.latitude && loc.longitude)) {
      calculateRouteData();
    }
    
    isFirstRender.current = false;
  }, [locations, onRouteDataUpdate, region, routeName]);
  
  // For demo purposes, let's render a simplified map representation
  // In a production app, this would integrate with Google Maps or Leaflet
  
  return (
    <div className={`relative ${className}`} style={{ height }}>
      {/* Placeholder map with location markers */}
      <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
        {locations.length >= 2 ? (
          <div className="h-full w-full relative overflow-hidden bg-blue-50">
            {/* Mock route line */}
            <div className="absolute h-1 bg-blue-500 top-1/2 left-4 right-4 transform -translate-y-1/2"></div>
            
            {/* Location markers */}
            {locations.map((location, index) => {
              // Position markers evenly along the route line
              const leftPosition = `${4 + (92 * (index / Math.max(1, locations.length - 1)))}%`;
              
              const isFirst = index === 0;
              const isLast = index === locations.length - 1;
              const markerColor = isFirst ? 'bg-green-500' : isLast ? 'bg-red-500' : 'bg-blue-500';
              
              return (
                <div 
                  key={`marker-${location.id}-${index}`}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{ 
                    top: '50%', 
                    left: leftPosition,
                  }}
                >
                  <div className={`${markerColor} w-4 h-4 rounded-full flex items-center justify-center`}>
                    <span className="text-white text-xs font-bold">{index + 1}</span>
                  </div>
                  
                  {/* Location name tooltip */}
                  <div className="absolute top-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs">
                    {location.name}
                  </div>
                  
                  {/* Stop metrics */}
                  {showStopMetrics && index > 0 && (
                    <div className="absolute bottom-5 left-1/2 transform -translate-x-1/2 bg-white px-2 py-1 rounded shadow-md text-xs">
                      <div className="whitespace-nowrap text-center">
                        ~{((index / Math.max(1, locations.length - 1)) * 100).toFixed(0)} km
                      </div>
                      <div className="whitespace-nowrap text-center">
                        ~{((index / Math.max(1, locations.length - 1)) * 60).toFixed(0)} min
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
            
            {/* Traffic indicator */}
            {showTraffic && (
              <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md">
                <div className="flex items-center gap-1 text-xs">
                  <span className="font-medium">Traffic:</span>
                  <div className={`${getTrafficColor(getCurrentTrafficCondition())} w-2 h-2 rounded-full`}></div>
                  <span>{getCurrentTrafficCondition()}</span>
                </div>
              </div>
            )}
            
            {/* Moving truck visualization */}
            <div className="absolute top-1/2 left-1/4 transform -translate-y-1/2">
              <Truck className="h-5 w-5 text-slate-700" />
            </div>
          </div>
        ) : (
          <div className="text-center p-4">
            <MapPin className="h-12 w-12 mx-auto text-slate-400" />
            <p className="mt-2 text-slate-500">
              Add at least two locations to view the route
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RouteMap;
