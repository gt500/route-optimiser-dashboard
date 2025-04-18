
import React, { useState, useEffect } from 'react';
import RouteMetricsCard from './RouteMetricsCard';
import { CircleX, CircleCheck, Clock, Fuel, ChevronsDown, ChevronsUp, MapPin, TruckIcon, AlertTriangle } from 'lucide-react';

interface RouteMetricsGridProps {
  distance: number;
  duration: number;
  fuelConsumption: number;
  fuelCost: number;
  cylinders: number;
  locations: number;
  totalWeight?: number;
  fuelCostPerLiter?: number;
  trafficConditions?: 'light' | 'moderate' | 'heavy';
  usingRealTimeData?: boolean;
  onFuelCostChange?: (newCost: number) => void;
}

const RouteMetricsGrid: React.FC<RouteMetricsGridProps> = ({
  distance = 0,
  duration = 0,
  fuelConsumption = 0,
  fuelCost = 0,
  cylinders = 0,
  locations = 0,
  totalWeight = 0,
  fuelCostPerLiter = 0,
  trafficConditions = 'moderate',
  usingRealTimeData = true,
  onFuelCostChange
}) => {
  const [localFuelCost, setLocalFuelCost] = useState(fuelCost);
  const [localFuelCostPerLiter, setLocalFuelCostPerLiter] = useState(fuelCostPerLiter);
  
  // Update local state when props change
  useEffect(() => {
    setLocalFuelCost(fuelCost);
    if (fuelCostPerLiter) {
      setLocalFuelCostPerLiter(fuelCostPerLiter);
    }
  }, [fuelCost, fuelCostPerLiter]);
  
  // Handle fuel cost changes
  const handleFuelCostChange = (newCostPerLiter: number) => {
    setLocalFuelCostPerLiter(newCostPerLiter);
    
    // Calculate the new total fuel cost based on consumption and new price
    const newTotalFuelCost = fuelConsumption * newCostPerLiter;
    setLocalFuelCost(newTotalFuelCost);
    
    // Pass the updated cost to the parent component
    if (onFuelCostChange) {
      onFuelCostChange(newCostPerLiter);
    }
  };
  
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
  
  // Calculate CO2 emissions - about 2.3 kg CO2 per liter of diesel
  const calculateCO2Emissions = (): number => {
    return fuelConsumption * 2.3; // kg of CO2
  };

  const estimatedMaintenanceCost = distance * 0.85; // R0.85 per km for maintenance
  const totalOperatingCost = localFuelCost + estimatedMaintenanceCost;
  
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <RouteMetricsCard 
        title="Total Distance"
        value={formatDistance(distance)}
        icon={<MapPin className="h-5 w-5" />}
        color="bg-blue-600"
        subtitle={usingRealTimeData ? "Based on real-time data" : "Based on map calculation"}
        tooltip="Total distance of the optimized route"
      />
      <RouteMetricsCard 
        title="Estimated Time"
        value={formatTime(duration)}
        icon={<Clock className="h-5 w-5" />}
        color="bg-amber-600"
        subtitle={getTrafficStatus()}
        tooltip="Estimated driving time with current traffic conditions"
      />
      <RouteMetricsCard 
        title="Operating Cost"
        value={`R ${totalOperatingCost.toFixed(2)}`}
        icon={<Fuel className="h-5 w-5" />}
        color="bg-green-600"
        subtitle={
          <>
            <div className="mb-1 text-xs">
              Fuel: R{localFuelCost.toFixed(2)} • Maintenance: R{estimatedMaintenanceCost.toFixed(2)}
            </div>
            <div className="text-xs text-green-700">
              CO₂: {calculateCO2Emissions().toFixed(1)}kg
            </div>
          </>
        }
        tooltip="Total operating cost including fuel and maintenance"
      />
      <RouteMetricsCard 
        title="Load Details"
        value={cylinders > 0 ? `${cylinders} Cylinders` : "No Load"}
        icon={<TruckIcon className="h-5 w-5" />}
        color="bg-indigo-600"
        subtitle={
          totalWeight > 0 ? 
          <div className={totalWeight > 1000 ? "text-amber-600 font-medium" : ""}>
            {totalWeight.toFixed(0)} kg total weight
            {totalWeight > 1000 && <AlertTriangle className="h-3 w-3 inline ml-1" />}
          </div> : 
          "No weight data"
        }
        tooltip="Total number of cylinders and weight in the vehicle"
      />
    </div>
  );
};

export default RouteMetricsGrid;
