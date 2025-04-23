import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Check, Fuel, AlertTriangle, Truck } from 'lucide-react';
import FuelCostEditor from './FuelCostEditor';
import RouteMetricsGrid from './metrics/RouteMetricsGrid';
import { LocationType } from '@/types/location';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { VehicleConfigProps } from '@/hooks/routes/types';
import { Vehicle } from '@/types/fleet';
import RouteActions from './RouteActions';
import { EMPTY_CYLINDER_WEIGHT_KG, CYLINDER_WEIGHT_KG } from '@/hooks/routes/types';

// Use imported constants instead of redefining
const FULL_CYLINDER_WEIGHT_KG = CYLINDER_WEIGHT_KG;  // Weight of a full cylinder in kg

interface RouteDetailsProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    cylinders: number;
    locations: LocationType[];
    estimatedDuration?: number;
    trafficConditions?: 'light' | 'moderate' | 'heavy'; 
    name?: string;
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
  const [isAlertAcknowledged, setIsAlertAcknowledged] = useState<boolean>(false);

  // Calculate total weight of all cylinders with consistent weight values
  useEffect(() => {
    // Use 22kg for full cylinders, 12kg for empty cylinders
    const weight = route.cylinders * CYLINDER_WEIGHT_KG;
    setTotalWeight(weight);
    
    // Reset acknowledgment when weight changes
    if (isOverweight) {
      setIsAlertAcknowledged(false);
    }
  }, [route.locations, route.cylinders, isOverweight]);

  const handleSetFuelCost = (cost: number) => {
    onFuelCostUpdate(cost);
  };

  // Find the assigned vehicle details if one is selected
  const assignedVehicle = selectedVehicle ? 
    vehicles.find(v => v.id === selectedVehicle) : 
    null;

  // Prepare route data for the RouteActions component
  const routeData = {
    name: route.name || "Route Report",
    stops: route.locations.map(location => ({
      siteName: location.name,
      cylinders: (location.type === 'Customer' ? location.emptyCylinders : location.fullCylinders) || 0,
      kms: location.distance !== undefined ? location.distance : 0,
      fuelCost: location.fuel_cost !== undefined ? location.fuel_cost : 0
    }))
  };

  const handleAcknowledgeAlert = () => {
    setIsAlertAcknowledged(true);
  };

  return (
    <Card className="border shadow-sm p-4">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-medium text-lg">Route Summary</h3>
          <div className="flex items-center gap-2">
            {isLoadConfirmed ? (
              <div className="flex gap-2">
                <RouteActions 
                  onSave={onSave}
                  onOptimize={onOptimize}
                  usingRealTimeData={false}
                  disabled={false}
                  routeData={routeData}
                />
              </div>
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
          <Alert 
            variant="destructive" 
            className={`mb-2 py-2 border-2 border-red-500 ${!isAlertAcknowledged ? 'animate-pulse' : ''}`}
            style={{
              animation: !isAlertAcknowledged ? 'pulse 0.8s infinite alternate' : 'none',
              backgroundColor: !isAlertAcknowledged ? 'rgba(239, 68, 68, 0.1)' : 'transparent',
            }}
          >
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <AlertDescription className="font-bold text-red-600">
              Weight limit exceeded! You cannot confirm this load until you reduce the number of cylinders.
              <div className="mt-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={handleAcknowledgeAlert}
                  className="border-red-500 text-red-600 hover:bg-red-50 mt-1"
                >
                  Acknowledge
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        )}

        <div className="overflow-hidden">
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
        </div>
        
        {assignedVehicle && (
          <div className="bg-blue-50 p-3 rounded-md flex items-center gap-2 text-blue-700 mt-2 overflow-hidden">
            <Truck className="h-4 w-4 flex-shrink-0" />
            <div className="min-w-0 flex-1">
              <span className="block truncate">
                Assigned to: <strong>{assignedVehicle.name}</strong> ({assignedVehicle.licensePlate})
              </span>
              {assignedVehicle.maxPayload && 
                <span className="block text-sm truncate">
                  Max payload: {assignedVehicle.maxPayload} kg • Current load: {totalWeight} kg
                  {totalWeight > (assignedVehicle.maxPayload || 0) && 
                    <span className="text-red-600 ml-1">(Overweight!)</span>
                  }
                </span>
              }
            </div>
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
