
import React from 'react';
import { MapPin, Clock, Fuel, TruckIcon, Package, Weight } from 'lucide-react';
import RouteMetricsCard from './RouteMetricsCard';

interface RouteMetricsGridProps {
  distance: number;
  duration: number;
  cylinders: number;
  fuelConsumption: number;
  fuelCost: number;
  locations: number;
  fuelCostPerLiter?: number;
  trafficConditions?: 'light' | 'moderate' | 'heavy';
  totalWeight?: number;
}

const RouteMetricsGrid: React.FC<RouteMetricsGridProps> = ({
  distance,
  duration,
  cylinders,
  fuelConsumption,
  fuelCost,
  locations,
  fuelCostPerLiter = 21.95,
  trafficConditions = 'moderate',
  totalWeight
}) => {
  // Ensure we have valid non-zero values for display with more realistic calculations
  const displayDistance = distance > 0 ? distance : 0.1;
  
  // Calculate a more realistic duration based on distance and number of stops
  // Average urban speed in South Africa is about 35-45 km/h depending on traffic
  const avgSpeedKmh = trafficConditions === 'light' ? 45 : (trafficConditions === 'moderate' ? 35 : 25);
  const stopTimeMinutes = 8; // Average time spent at each stop for loading/unloading
  
  const drivingTimeMinutes = (displayDistance / avgSpeedKmh) * 60;
  const stopsTimeMinutes = locations * stopTimeMinutes;
  
  const displayDuration = duration > 0 ? duration : (drivingTimeMinutes + stopsTimeMinutes);
  
  // Calculate fuel consumption and cost based on actual distance
  const displayFuelConsumption = fuelConsumption > 0 ? fuelConsumption : (displayDistance * 0.12);
  const displayFuelCost = fuelCost > 0 ? fuelCost : (displayFuelConsumption * fuelCostPerLiter);
  
  // Format distance for display - ensure we show km not meters when small
  const formattedDistance = displayDistance < 0.1 ? 
    `${Math.round(displayDistance * 1000)} m` : 
    `${displayDistance.toFixed(1)} km`;

  // Format duration for display with better human-readable format
  let formattedDuration: string;
  const durationMinutes = Math.max(1, Math.round(displayDuration));
  
  if (durationMinutes < 60) {
    formattedDuration = `${durationMinutes} min`;
  } else {
    const hours = Math.floor(durationMinutes / 60);
    const mins = durationMinutes % 60;
    formattedDuration = hours > 0 ? 
      (mins > 0 ? `${hours}h ${mins}m` : `${hours}h`) : 
      `${mins} min`;
  }
  
  // Traffic condition info with South African context
  const trafficInfo = {
    'light': { color: 'bg-green-500', text: 'Light traffic' },
    'moderate': { color: 'bg-orange-500', text: 'Moderate traffic' },
    'heavy': { color: 'bg-red-500', text: 'Heavy traffic' }
  };
  
  return (
    <div className="grid grid-cols-2 gap-3">
      <RouteMetricsCard
        title="Total Distance"
        value={formattedDistance}
        icon={<MapPin className="h-5 w-5" />}
        color="bg-blue-500"
        tooltip="Total road distance for all stops in route"
        subtitle={
          <div className="text-xs text-muted-foreground mt-1">
            Based on real-time routing data
          </div>
        }
      />
      
      <RouteMetricsCard
        title="Estimated Time"
        value={formattedDuration}
        icon={<Clock className="h-5 w-5" />}
        color="bg-orange-500"
        tooltip="Estimated time to complete all deliveries including stops"
        subtitle={
          <div className="flex items-center text-xs mt-1">
            <div className={`h-2 w-2 rounded-full mr-1 ${trafficInfo[trafficConditions].color}`}></div>
            <span className="text-muted-foreground">{trafficInfo[trafficConditions].text}</span>
          </div>
        }
      />
      
      <RouteMetricsCard
        title="Operating Cost"
        value={`R ${displayFuelCost.toFixed(2)}`}
        icon={<Fuel className="h-5 w-5" />}
        color="bg-green-500"
        tooltip="Estimated fuel cost based on distance and vehicle type"
      />
      
      <RouteMetricsCard
        title="Load Details"
        value={`${cylinders} Cylinders`}
        icon={<Package className="h-5 w-5" />}
        color="bg-indigo-500"
        tooltip="Number of gas cylinders assigned to this route"
        subtitle={totalWeight ? (
          <div className="text-xs text-muted-foreground mt-1 flex items-center">
            <Weight className="h-3 w-3 mr-1" />
            {Math.round(totalWeight)} kg total weight
          </div>
        ) : null}
      />
    </div>
  );
};

export default RouteMetricsGrid;
