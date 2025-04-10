
import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Fuel, AlertTriangle, Truck } from 'lucide-react';
import FuelCostEditor from './FuelCostEditor';
import RouteMetricsGrid from './metrics/RouteMetricsGrid';
import { LocationType } from '@/components/locations/LocationEditDialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VehicleConfigProps } from '@/hooks/useRouteManagement';
import { Vehicle } from '@/types/fleet';

// Constants for accurate weight calculations
const EMPTY_CYLINDER_WEIGHT_KG = 14; // Weight of an empty cylinder in kg
const FULL_CYLINDER_WEIGHT_KG = 28;  // Weight of a full cylinder in kg
const CYLINDER_GAS_WEIGHT_KG = 14;   // Weight of the gas in a cylinder

interface RouteDetailsProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    cylinders: number;
    locations: LocationType[];
    estimatedDuration?: number;
    trafficConditions?: 'light' | 'moderate' | 'heavy'; 
  };
  isLoadConfirmed?: boolean;
  isOverweight?: boolean;
  onRemoveLocation: (index: number) => void;
  onFuelCostUpdate: (newCost: number) => void;
  onRouteDataUpdate: (distance: number, duration: number, trafficConditions?: string) => void;
  onOptimize: () => void;
  onSave: () => void;
  vehicleConfig: VehicleConfigProps;
  selectedVehicle?: string | null;
  vehicles?: Vehicle[];
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
  vehicleConfig,
  selectedVehicle,
  vehicles = []
}) => {
  const [totalWeight, setTotalWeight] = useState<number>(0);

  // Calculate total weight of all cylinders more accurately
  useEffect(() => {
    let weight = 0;
    
    route.locations.forEach(location => {
      // For customer locations, count empty cylinders weight
      if (location.type === 'Customer' && location.emptyCylinders) {
        weight += location.emptyCylinders * EMPTY_CYLINDER_WEIGHT_KG;
      }
      
      // For storage locations, count full cylinders weight
      if ((location.type === 'Storage' || location.type === 'Distribution') && location.fullCylinders) {
        weight += location.fullCylinders * FULL_CYLINDER_WEIGHT_KG;
      }
    });
    
    setTotalWeight(weight);
  }, [route.locations]);

  const handleSetFuelCost = (cost: number) => {
    onFuelCostUpdate(cost);
  };

  // Find the assigned vehicle details if one is selected
  const assignedVehicle = selectedVehicle ? 
    vehicles.find(v => v.id === selectedVehicle) : 
    null;

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
          <Alert variant="destructive" className="mb-2 py-2 border-2 border-red-500">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="font-bold text-red-600">
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
          fuelCostPerLiter={vehicleConfig.fuelPrice}
          trafficConditions={route.trafficConditions}
          totalWeight={totalWeight}
        />
        
        {assignedVehicle && (
          <div className="bg-blue-50 p-3 rounded-md flex items-center gap-2 text-blue-700">
            <Truck className="h-4 w-4" />
            <span>
              Assigned to: <strong>{assignedVehicle.name}</strong> ({assignedVehicle.licensePlate})
              {assignedVehicle.maxPayload && 
                <span className="ml-1 text-sm font-medium">
                  • Max payload: {assignedVehicle.maxPayload} kg • Current load: {totalWeight} kg
                  {totalWeight > (assignedVehicle.maxPayload || 0) && 
                    <span className="text-red-600 ml-1">(Overweight!)</span>
                  }
                </span>
              }
            </span>
          </div>
        )}
        
        <div className="pt-2">
          <div className="flex items-center justify-between mb-2">
            <div className="font-medium flex items-center gap-1">
              <Fuel className="h-4 w-4" />
              Fuel Settings
            </div>
          </div>
          <FuelCostEditor 
            currentCost={vehicleConfig.fuelPrice} 
            onChange={handleSetFuelCost}
            fuelConsumption={vehicleConfig.baseConsumption}
            isDisabled={isLoadConfirmed}
          />
        </div>
      </div>
    </Card>
  );
};

export default RouteDetails;
