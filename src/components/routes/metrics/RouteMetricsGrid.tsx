
import React from 'react';
import RouteMetricsCard from './RouteMetricsCard';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Clock, Fuel } from 'lucide-react';
import FuelCostEditor from '../FuelCostEditor';

interface RouteMetricsGridProps {
  distance: number;
  duration: number;
  fuelConsumption: number;
  fuelCost: number;
  cylinders: number;
  fuelCostPerLiter: number;
  trafficConditions?: 'light' | 'moderate' | 'heavy';
  usingRealTimeData?: boolean;
  onFuelCostChange: (newCost: number) => void;
}

const RouteMetricsGrid = ({
  distance,
  duration,
  fuelConsumption,
  fuelCost,
  cylinders,
  fuelCostPerLiter,
  trafficConditions,
  usingRealTimeData,
  onFuelCostChange
}: RouteMetricsGridProps) => {
  const getTrafficBadgeVariant = (condition?: 'light' | 'moderate' | 'heavy') => {
    switch (condition) {
      case 'light': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'moderate': return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'heavy': return 'bg-red-50 text-red-700 border-red-200';
      default: return 'bg-blue-50 text-blue-700 border-blue-200';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <RouteMetricsCard
        title="Total Distance"
        value={`${distance.toFixed(1)} km`}
        tooltip={usingRealTimeData 
          ? 'Distance calculated using real-time traffic data for the fastest route.' 
          : 'Total distance calculated based on the optimized route between all stops.'}
        subtitle={
          <span className="text-xs text-muted-foreground flex items-center gap-1">
            <Clock className="h-3 w-3" />
            <span className="text-gray-300">Estimated travel time: {duration} min</span>
            {trafficConditions && (
              <Badge variant="outline" className={getTrafficBadgeVariant(trafficConditions)}>
                {trafficConditions} traffic
              </Badge>
            )}
          </span>
        }
      />
      
      <RouteMetricsCard
        title="Fuel Consumption"
        value={`${fuelConsumption.toFixed(1)} L`}
        subtitle="Based on average consumption of 12L/100km"
      />
      
      <RouteMetricsCard
        title={
          <div className="flex items-center justify-between w-full">
            <span>Fuel Cost</span>
            <FuelCostEditor 
              currentFuelCost={fuelCostPerLiter} 
              onFuelCostChange={onFuelCostChange} 
            />
          </div>
        }
        value={`R ${fuelCost.toFixed(2)}`}
        subtitle={`At current price of R${fuelCostPerLiter.toFixed(2)}/L`}
      />
      
      <RouteMetricsCard
        title="Load"
        value={`${cylinders}/80 cylinders`}
        subtitle={<Progress value={(cylinders/80)*100} className="h-2 mt-2" />}
      />
    </div>
  );
};

export default RouteMetricsGrid;
