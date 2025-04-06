import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Fuel, AlertTriangle } from 'lucide-react';
import FuelCostEditor from './FuelCostEditor';
import RouteMetricsGrid from './metrics/RouteMetricsGrid';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VehicleConfigProps } from '@/hooks/useRouteManagement';

interface RouteDetailsProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    cylinders: number;
    locations: LocationType[];
    estimatedDuration?: number;
  };
  isLoadConfirmed?: boolean;
  isOverweight?: boolean;
  onRemoveLocation: (index: number) => void;
  onFuelCostUpdate: (newCost: number) => void;
  onRouteDataUpdate: (distance: number, duration: number) => void;
  onOptimize: () => void;
  onSave: () => void;
  vehicleConfig: VehicleConfigProps;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  route,
  isLoadConfirmed = false,
  isOverweight = false,
  onRemoveLocation,
  onFuelCostUpdate,
  onRouteDataUpdate,
  onOptimize,
  onSave,
  vehicleConfig
}) => {
  const [estimatedTime, setEstimatedTime] = useState<number>(route.estimatedDuration || 0);
  const [totalCost, setTotalCost] = useState<number>(route.fuelCost);

  const calculateEstimatedTime = () => {
    const calculatedTime = route.locations.length * 60;
    setEstimatedTime(calculatedTime);
    return calculatedTime;
  };

  const calculateTotalCost = () => {
    const calculatedCost = route.distance * 0.5;
    setTotalCost(calculatedCost);
    return calculatedCost;
  };

  const handleSetFuelCost = (cost: number) => {
    onFuelCostUpdate(cost);
  };

  return (
    <Card className="border shadow-sm p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Route Summary</h3>
          <div className="flex items-center gap-2">
            {isLoadConfirmed ? (
              <Button disabled variant="outline" className="gap-1">
                <Check className="h-4 w-4 text-green-500" />
                Saved
              </Button>
            ) : (
              <Button 
                onClick={onSave} 
                disabled={route.locations.length < 2 || isOverweight}
                className="gap-1"
              >
                Confirm Load
              </Button>
            )}
          </div>
        </div>
        
        {isOverweight && (
          <Alert variant="destructive" className="mb-2 py-2">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Weight limit exceeded! You cannot confirm this load until you reduce the number of cylinders.
            </AlertDescription>
          </Alert>
        )}

        <RouteMetricsGrid 
          distance={route.distance} 
          duration={route.estimatedDuration || 0} 
          cylinders={route.cylinders} 
          fuelConsumption={route.fuelConsumption}
          fuelCost={route.fuelCost}
          locations={route.locations.length}
        />
        
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              Fuel Settings
            </div>
          </div>
          <FuelCostEditor 
            fuelCost={vehicleConfig.fuelPrice} 
            onSetFuelCost={handleSetFuelCost}
            fuelConsumption={vehicleConfig.baseConsumption}
            isDisabled={isLoadConfirmed}
          />
        </div>
      </div>
    </Card>
  );
};

export default RouteDetails;
