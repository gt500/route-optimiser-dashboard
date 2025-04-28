
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
import { calculateRoadDistances, estimateTravelTime } from '@/utils/route/routeCalculation';

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
  onRemoveLocation?: (index: number) => void;
  onFuelCostUpdate: (newCost: number) => void;
  onRouteDataUpdate?: (distance: number, duration: number, trafficConditions?: string) => void;
  onOptimize: () => void;
  onConfirmLoad: () => void; // Added this missing prop
  onSave?: () => void;
  vehicleConfig: VehicleConfigProps;
  selectedVehicle?: string | null;
  vehicles?: Vehicle[];
  onVehicleChange?: (vehicleId: string) => void; // Added this prop
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
  onConfirmLoad, // Using the new prop
  onSave,
  vehicleConfig,
  selectedVehicle,
  vehicles = [],
  onVehicleChange, // Using the new prop
  startLocationId = null,
  endLocationId = null
}) => {
  const [totalWeight, setTotalWeight] = useState<number>(0);
  const [isAlertAcknowledged, setIsAlertAcknowledged] = useState<boolean>(false);
  const [calculatedSegmentDetails, setCalculatedSegmentDetails] = useState<{
    distances: number[];
    durations: number[];
  }>({ distances: [], durations: [] });

  useEffect(() => {
    if (!route.locations || route.locations.length === 0) {
      setTotalWeight(0);
      setCalculatedSegmentDetails({ distances: [], durations: [] });
      return;
    }
    
    // Calculate actual weight from all locations
    const weight = calculateTotalWeight(route.locations, startLocationId, endLocationId);
    setTotalWeight(weight);
    
    if (isOverweight) {
      setIsAlertAcknowledged(false);
    }
    
    // If we have locations but no distance data, calculate realistic values
    if (route.locations.length >= 2) {
      // Calculate distances between each location
      const locationCoordinates = route.locations.map(loc => ({
        latitude: loc.lat || 0,
        longitude: loc.long || 0
      }));
      
      // Calculate segment distances - properly handle the Promise
      const fetchSegmentDistances = async () => {
        try {
          const segmentDistances = await calculateRoadDistances(locationCoordinates);
          
          // Calculate segment durations based on distances
          const segmentDurations = segmentDistances.map(
            distance => estimateTravelTime(distance, route.trafficConditions)
          );
          
          // Store the calculated segments
          setCalculatedSegmentDetails({
            distances: segmentDistances,
            durations: segmentDurations
          });
          
          // Calculate total distance
          const totalDistance = segmentDistances.reduce((sum, d) => sum + d, 0);
          
          // If the route doesn't have distance data or it's unrealistically low, update it
          if (!route.distance || route.distance <= 0 || 
              (route.distance < 5 && route.locations.length > 1)) {
            
            // Calculate total time including stops
            const totalDriveMinutes = segmentDurations.reduce((sum, d) => sum + d, 0);
            const stopTimePerLocation = 8; // minutes for loading/unloading at each stop
            const totalStopMinutes = route.locations.length * stopTimePerLocation;
            const totalTime = totalDriveMinutes + totalStopMinutes;
            
            console.log(`Calculated route metrics: ${totalDistance.toFixed(1)}km, ${Math.round(totalTime)}mins`);
            
            // Update the parent component with the calculated values
            onRouteDataUpdate(totalDistance, totalTime, route.trafficConditions);
          }
        } catch (error) {
          console.error('Error calculating segment distances:', error);
          // Set some default values in case of error
          setCalculatedSegmentDetails({
            distances: Array(route.locations.length).fill(10),
            durations: Array(route.locations.length).fill(15)
          });
        }
      };
      
      // Call the async function
      fetchSegmentDistances();
    }
  }, [route.locations, route.distance, route.cylinders, isOverweight, startLocationId, endLocationId, route.trafficConditions]);

  const handleSetFuelCost = (cost: number) => {
    onFuelCostUpdate(cost);
  };

  const assignedVehicle = selectedVehicle ? 
    vehicles.find(v => v.id === selectedVehicle) : 
    null;

  // Prepare route data for export/display
  const routeData = {
    name: route.name || "Route Report",
    stops: route.locations.map((location, index) => {
      // For the first location (starting point), show no distance
      if (index === 0) {
        return {
          siteName: location.name,
          cylinders: (location.type === 'Customer' ? location.emptyCylinders : location.fullCylinders) || 0,
          kms: 0,
          fuelCost: 0
        };
      }

      // Get distance from the waypoint data if available, or from the calculated segments
      let segmentDistance: number;
      if (route.waypointData && route.waypointData[index - 1]) {
        segmentDistance = route.waypointData[index - 1].distance;
      } else if (calculatedSegmentDetails.distances[index - 1]) {
        segmentDistance = calculatedSegmentDetails.distances[index - 1];
      } else {
        // Fallback to an estimated distance based on total route
        segmentDistance = route.distance / Math.max(1, route.locations.length - 1);
      }
      
      // Calculate fuel consumption and cost for this segment
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

  // Ensure we have valid minimum values for all metrics
  const minDistancePerLocation = 15.0; // km - more realistic minimum
  const defaultDistance = Math.max(route.locations.length * minDistancePerLocation, 1);
  
  // Calculate valid distance - use route.distance if available and reasonable
  const validDistance = (route.distance > 0 && (route.locations.length <= 1 || route.distance >= 5)) ? 
    route.distance : defaultDistance;
    
  // Calculate valid duration - ensure it's proportional to distance and includes stops
  const stopTimeMinutes = route.locations.length * 8; // 8 minutes per stop
  
  let validDuration: number;
  if (route.estimatedDuration && route.estimatedDuration > 0) {
    validDuration = route.estimatedDuration;
  } else {
    // Calculate based on an average speed of 40 km/h plus stop time
    validDuration = (validDistance / 40 * 60) + stopTimeMinutes;
  }
  
  // Ensure minimum values
  validDuration = Math.max(validDuration, route.locations.length * 15);
  
  // Calculate fuel consumption and cost
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
                onClick={onConfirmLoad} // Use the onConfirmLoad prop here
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
