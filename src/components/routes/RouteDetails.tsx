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
import { EMPTY_CYLINDER_WEIGHT_KG, CYLINDER_WEIGHT_KG, MAX_CYLINDERS } from '@/hooks/routes/types';
import { calculateTotalWeight } from '@/utils/route/weightUtils';
import { calculateRouteFuelConsumption, calculateFuelCost } from '@/utils/route/fuelUtils';

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
    waypointData?: { distance: number; duration: number }[];
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
  startLocationId?: string | null;
  endLocationId?: string | null;
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
  vehicles = [],
  startLocationId = null,
  endLocationId = null
}) => {
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [isAlertAcknowledged, setIsAlertAcknowledged] = useState<boolean>(false);

  useEffect(() => {
    if (!route.locations || route.locations.length === 0) {
      setTotalWeight(0);
      return;
    }
    
    const weight = calculateTotalWeight(route.locations, startLocationId, endLocationId);
    setTotalWeight(weight);
    
    if (isOverweight) {
      setIsAlertAcknowledged(false);
    }
  }, [route.locations, route.cylinders, isOverweight, startLocationId, endLocationId]);

  const handleSetFuelCost = (cost: number) => {
    onFuelCostUpdate(cost);
  };

  const assignedVehicle = selectedVehicle ? 
    vehicles.find(v => v.id === selectedVehicle) : 
    null;

  const routeData = {
    name: route.name || "Route Report",
    stops: route.locations.map((location, index) => {
      if (index === 0) {
        return {
          siteName: location.name,
          cylinders: (location.type === 'Customer' ? location.emptyCylinders : location.fullCylinders) || 0,
          kms: 0,
          fuelCost: 0
        };
      }

      const previousSegment = Math.max(0, index - 1);
      const segmentData = route.waypointData && route.waypointData[previousSegment];
      
      const segmentDistance = segmentData?.distance || 
        (route.distance / Math.max(1, route.locations.length - 1));
        
      const segmentFuelConsumption = calculateRouteFuelConsumption(
        segmentDistance,
        route.locations.slice(0, index + 1),
        route.trafficConditions === 'heavy'
      );
      
      const segmentFuelCost = calculateFuelCost(
        segmentFuelConsumption, 
        vehicleConfig.fuelPrice
      );

      return {
        siteName: location.name,
        cylinders: (location.type === 'Customer' ? location.emptyCylinders : location.fullCylinders) || 0,
        kms: Math.round(segmentDistance * 10) / 10,
        fuelCost: Math.round(segmentFuelCost * 100) / 100
      };
    })
  };

  const handleAcknowledgeAlert = () => {
    setIsAlertAcknowledged(true);
  };

  const maxAllowedWeight = vehicleConfig.maxWeight || (MAX_CYLINDERS * CYLINDER_WEIGHT_KG);
  const vehicleIsOverweight = totalWeight > maxAllowedWeight;

  const validDistance = route.distance > 0 ? route.distance : route.locations.length * 5.0;
  const validDuration = route.estimatedDuration && route.estimatedDuration > 0 ? 
    route.estimatedDuration : route.locations.length * 15;
  const validFuelConsumption = route.fuelConsumption > 0 ? 
    route.fuelConsumption : (validDistance * vehicleConfig.baseConsumption) / 100;
  const validFuelCost = route.fuelCost > 0 ? 
    route.fuelCost : validFuelConsumption * vehicleConfig.fuelPrice;

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
                disabled={route.locations.length < 2 || vehicleIsOverweight}
                className="gap-1"
              >
                Confirm Load
              </Button>
            )}
          </div>
        </div>
        
        {vehicleIsOverweight && (
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
            distance={validDistance} 
            duration={validDuration} 
            cylinders={route.cylinders} 
            fuelConsumption={validFuelConsumption}
            fuelCost={validFuelCost}
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
                  Max payload: {assignedVehicle.maxPayload} kg • Current load: {Math.round(totalWeight)} kg
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
