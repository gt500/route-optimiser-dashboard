
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, ArrowRight, Clock, Fuel, DollarSign, Route } from 'lucide-react';
import { LocationType } from '@/types/location';
import { formatDuration } from '@/utils/route/trafficUtils';

interface RouteOptimizationPanelProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    locations: LocationType[];
    trafficConditions: 'light' | 'moderate' | 'heavy';
    estimatedDuration: number;
    waypointData?: { distance: number; duration: number }[];
  };
  onClose: () => void;
}

const RouteOptimizationPanel: React.FC<RouteOptimizationPanelProps> = ({ route, onClose }) => {
  // Calculate metrics for each segment of the route
  const getSegmentMetrics = () => {
    if (route.locations.length <= 1) return [];

    const segments = [];
    let cumulativeDistance = 0;
    let cumulativeDuration = 0;
    let cumulativeFuel = 0;
    let cumulativeCost = 0;

    for (let i = 0; i < route.locations.length - 1; i++) {
      const from = route.locations[i];
      const to = route.locations[i + 1];
      
      // Get segment distance and duration from waypoint data if available
      let segmentDistance = 0;
      let segmentDuration = 0;
      
      if (route.waypointData && route.waypointData[i]) {
        segmentDistance = route.waypointData[i].distance;
        segmentDuration = route.waypointData[i].duration;
      } else {
        segmentDistance = route.distance / Math.max(1, route.locations.length - 1);
        segmentDuration = route.estimatedDuration / Math.max(1, route.locations.length - 1);
      }
      
      cumulativeDistance += segmentDistance;
      cumulativeDuration += segmentDuration;
      
      // Calculate segment fuel consumption based on segment distance
      const segmentFuelRatio = segmentDistance / Math.max(0.1, route.distance);
      const segmentFuel = route.fuelConsumption * segmentFuelRatio;
      cumulativeFuel += segmentFuel;
      
      // Calculate segment cost
      const segmentCost = route.fuelCost * segmentFuelRatio;
      cumulativeCost += segmentCost;
      
      segments.push({
        from: from.name,
        to: to.name,
        distance: segmentDistance,
        duration: segmentDuration,
        fuel: segmentFuel,
        cost: segmentCost,
        cumulativeDistance,
        cumulativeDuration,
        cumulativeFuel,
        cumulativeCost,
        cylinders: to.type === 'Customer' ? (to.emptyCylinders || 0) : (to.fullCylinders || 0)
      });
    }
    
    return segments;
  };

  const segments = getSegmentMetrics();

  // Determine traffic condition color
  const getTrafficColor = (condition: 'light' | 'moderate' | 'heavy') => {
    switch (condition) {
      case 'light': return 'bg-green-500';
      case 'moderate': return 'bg-amber-500';
      case 'heavy': return 'bg-red-500';
      default: return 'bg-amber-500';
    }
  };

  return (
    <Card className="h-full overflow-hidden">
      <CardHeader className="pb-2">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            <Route className="h-5 w-5" />
            Route Optimization Details
          </CardTitle>
          <Button variant="ghost" size="sm" onClick={onClose}>
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Map
          </Button>
        </div>
        <div className="flex gap-2 items-center">
          <span className="text-sm font-normal">Traffic Conditions:</span>
          <span className={`${getTrafficColor(route.trafficConditions)} w-3 h-3 rounded-full inline-block`}></span>
          <span className="text-sm font-medium capitalize">{route.trafficConditions}</span>
        </div>
      </CardHeader>
      
      <CardContent className="overflow-auto h-[340px] p-2">
        <div className="space-y-1">
          <div className="grid grid-cols-6 gap-2 py-1 px-2 bg-slate-100 rounded text-xs font-medium">
            <div>Route Stop</div>
            <div>Distance</div>
            <div>Duration</div>
            <div>Fuel</div>
            <div>Cost</div>
            <div>Cylinders</div>
          </div>

          {segments.map((segment, index) => (
            <div key={index} className="grid grid-cols-6 gap-2 py-2 px-2 border-b text-xs">
              <div className="font-medium">
                {index + 1}. {segment.from} → {segment.to}
              </div>
              <div className="flex items-center gap-1">
                <span>{segment.distance.toFixed(1)} km</span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3" />
                <span>{Math.round(segment.duration)} min</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="h-3 w-3" />
                <span>{segment.fuel.toFixed(1)} L</span>
              </div>
              <div className="flex items-center gap-1">
                <DollarSign className="h-3 w-3" />
                <span>${segment.cost.toFixed(2)}</span>
              </div>
              <div>
                <div className="bg-blue-500 rounded-full h-5 w-5 flex items-center justify-center text-white font-medium text-xs">
                  {segment.cylinders}
                </div>
              </div>
            </div>
          ))}
          
          {/* Summary row */}
          <div className="grid grid-cols-6 gap-2 py-2 px-2 bg-slate-100 rounded text-xs font-medium mt-2">
            <div>TOTALS:</div>
            <div>{route.distance.toFixed(1)} km</div>
            <div>{formatDuration(Math.round(route.estimatedDuration))}</div>
            <div>{route.fuelConsumption.toFixed(1)} L</div>
            <div>${route.fuelCost.toFixed(2)}</div>
            <div>{route.locations.reduce((sum, loc) => sum + (loc.emptyCylinders || loc.fullCylinders || 0), 0)}</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteOptimizationPanel;
