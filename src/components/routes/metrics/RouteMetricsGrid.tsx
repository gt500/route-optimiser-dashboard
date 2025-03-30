
import React from 'react';
import RouteMetricsCard from './RouteMetricsCard';
import FuelCostEditor from '../FuelCostEditor';
import { CircleX, CircleCheck, Clock, Fuel, ChevronsDown, ChevronsUp, MapPin, TruckIcon } from 'lucide-react';

interface RouteMetricsGridProps {
  distance: number;
  duration: number;
  fuelConsumption: number;
  fuelCost: number;
  cylinders: number;
  fuelCostPerLiter: number;
  trafficConditions?: 'light' | 'moderate' | 'heavy';
  usingRealTimeData?: boolean;
  onFuelCostChange?: (newCost: number) => void;
}

const RouteMetricsGrid: React.FC<RouteMetricsGridProps> = ({
  distance,
  duration,
  fuelConsumption,
  fuelCost,
  cylinders,
  fuelCostPerLiter,
  trafficConditions = 'moderate',
  usingRealTimeData = false,
  onFuelCostChange
}) => {
  const formatDistance = (km: number): string => {
    if (km < 1) return `${Math.round(km * 1000)} m`;
    return `${km.toFixed(1)} km`;
  };
  
  const formatTime = (minutes: number): string => {
    if (minutes < 60) return `${Math.round(minutes)} min`;
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };
  
  const getTrafficIcon = () => {
    switch(trafficConditions) {
      case 'light':
        return <CircleCheck className="h-4 w-4 text-green-500" />;
      case 'moderate':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'heavy':
        return <CircleX className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  };
  
  const getTrafficStatus = (): JSX.Element => {
    switch(trafficConditions) {
      case 'light':
        return (
          <div className="flex items-center gap-1 text-green-500">
            <ChevronsDown className="h-4 w-4" /> Light traffic
          </div>
        );
      case 'moderate':
        return (
          <div className="flex items-center gap-1 text-yellow-500">
            <Clock className="h-4 w-4" /> Moderate traffic
          </div>
        );
      case 'heavy':
        return (
          <div className="flex items-center gap-1 text-red-500">
            <ChevronsUp className="h-4 w-4" /> Heavy traffic
          </div>
        );
      default:
        return (
          <div className="flex items-center gap-1 text-yellow-500">
            <Clock className="h-4 w-4" /> Moderate traffic
          </div>
        );
    }
  };
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <RouteMetricsCard 
        title="Total Distance"
        value={formatDistance(distance)}
        icon={<MapPin className="h-5 w-5" />}
        color="blue"
        subtitle={usingRealTimeData ? "Based on real-time data" : "Based on map calculation"}
        tooltip="Total distance of the optimized route"
      />
      <RouteMetricsCard 
        title="Estimated Time"
        value={formatTime(duration)}
        icon={<Clock className="h-5 w-5" />}
        color="amber"
        subtitle={getTrafficStatus()}
        tooltip="Estimated driving time with current traffic conditions"
      />
      <RouteMetricsCard 
        title="Total Cylinders"
        value={cylinders.toString()}
        icon={<TruckIcon className="h-5 w-5" />}
        color="indigo"
        subtitle={`${Math.round(cylinders * 1.2)} kg estimated weight`}
        tooltip="Total number of cylinders to be delivered"
      />
      <RouteMetricsCard 
        title="Fuel Cost"
        value={`R ${fuelCost.toFixed(2)}`}
        icon={<Fuel className="h-5 w-5" />}
        color="green"
        subtitle={
          <FuelCostEditor 
            fuelConsumption={fuelConsumption} 
            fuelCostPerLiter={fuelCostPerLiter}
            onChange={onFuelCostChange}
          />
        }
        tooltip="Estimated fuel cost based on current prices"
      />
    </div>
  );
};

export default RouteMetricsGrid;
