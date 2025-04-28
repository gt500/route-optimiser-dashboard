
import React, { useState } from 'react';
import { CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import FuelCostEditor from './FuelCostEditor';
import { VehicleConfigProps } from '@/hooks/useRouteManagement';
import { Vehicle } from '@/types/fleet';
import { ChevronDown, ChevronUp, Clock, Fuel } from 'lucide-react';
import CylinderSelector from './LocationSelector/CylinderSelector';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface RouteDetailsProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    maintenanceCost: number;
    totalCost: number;
    cylinders: number;
    locations: any[];
    trafficConditions: 'light' | 'moderate' | 'heavy';
    estimatedDuration: number;
  };
  onFuelCostUpdate: (newCost: number) => void;
  onOptimize: () => void;
  isLoadConfirmed: boolean;
  onConfirmLoad: () => void;
  vehicleConfig: VehicleConfigProps;
  vehicles: Vehicle[];
  selectedVehicle: string | null;
  onVehicleChange: (vehicleId: string) => void;
  hideEndpoints?: boolean;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({
  route,
  onFuelCostUpdate,
  onOptimize,
  isLoadConfirmed,
  onConfirmLoad,
  vehicleConfig,
  vehicles,
  selectedVehicle,
  onVehicleChange,
  hideEndpoints = false,
}) => {
  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);

  // Helper function to format numbers for display
  const formatNumber = (value: number, decimals: number = 2): string => {
    return isNaN(value) ? '0.00' : value.toFixed(decimals);
  };

  // Calculate estimated delivery time in minutes
  const estimatedDeliveryTime = route.estimatedDuration || 0;
  
  // Format time as hours and minutes
  const formatTime = (minutes: number): string => {
    if (minutes <= 0) return '0 mins';
    if (minutes < 60) return `${Math.round(minutes)} mins`;
    
    const hours = Math.floor(minutes / 60);
    const mins = Math.round(minutes % 60);
    return `${hours}h ${mins}m`;
  };

  return (
    <CardContent className="px-3 py-4 space-y-5">
      {/* Status indicator for route details */}
      <div className="flex justify-between items-center">
        <div className="text-lg font-medium">Route Information</div>
        
        {route.trafficConditions && (
          <div className={`px-3 py-1 rounded-full text-sm ${
            route.trafficConditions === 'light' 
              ? 'bg-green-100 text-green-800' 
              : route.trafficConditions === 'moderate'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800'
          }`}>
            {route.trafficConditions.charAt(0).toUpperCase() + route.trafficConditions.slice(1)} traffic
          </div>
        )}
      </div>

      {/* Start/End Locations - Only show if not hidden */}
      {!hideEndpoints && route.locations.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <div className="text-sm font-medium">Start Location</div>
            <div className="text-sm bg-muted py-1.5 px-3 rounded-md">
              {route.locations[0]?.name || 'Not selected'}
            </div>
          </div>
          <div className="space-y-1">
            <div className="text-sm font-medium">End Location</div>
            <div className="text-sm bg-muted py-1.5 px-3 rounded-md">
              {route.locations[route.locations.length - 1]?.name || 'Not selected'}
            </div>
          </div>
        </div>
      )}

      {/* Route Basic metrics */}
      <div className="grid grid-cols-2 gap-4 text-sm">
        <div className="space-y-1">
          <div className="font-medium">Distance</div>
          <div className="flex items-center bg-blue-50 border border-blue-100 px-3 py-1.5 rounded-md text-blue-800">
            {formatNumber(route.distance, 1)} km
          </div>
        </div>
        <div className="space-y-1">
          <div className="font-medium">Estimated Time</div>
          <div className="flex items-center bg-amber-50 border border-amber-100 px-3 py-1.5 rounded-md text-amber-800">
            <Clock className="h-4 w-4 mr-1.5" />
            {formatTime(estimatedDeliveryTime)}
          </div>
        </div>
      </div>

      {/* Vehicle Selection */}
      <div className="space-y-1">
        <div className="font-medium text-sm">Assign Vehicle</div>
        <Select 
          value={selectedVehicle || ""} 
          onValueChange={onVehicleChange}
          disabled={isLoadConfirmed}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a vehicle" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="none">None</SelectItem>
            {vehicles.map(vehicle => (
              <SelectItem key={vehicle.id} value={vehicle.id}>
                {vehicle.name} ({vehicle.licensePlate})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Cost Breakdown */}
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <div className="font-medium text-sm">Cost Breakdown</div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-6 px-2 text-xs"
            onClick={() => setIsAdvancedOpen(!isAdvancedOpen)}
          >
            {isAdvancedOpen ? (
              <>
                <ChevronUp className="h-3 w-3 mr-1" />
                Less
              </>
            ) : (
              <>
                <ChevronDown className="h-3 w-3 mr-1" />
                More
              </>
            )}
          </Button>
        </div>
        
        <div className="space-y-1">
          <div className="flex justify-between items-center text-sm py-1 border-b">
            <span>Fuel</span>
            <span className="font-medium">R{formatNumber(route.fuelCost)}</span>
          </div>
          
          {isAdvancedOpen && (
            <>
              <div className="flex justify-between items-center text-sm py-1 border-b">
                <span>Fuel consumption</span>
                <span>{formatNumber(route.fuelConsumption)} L</span>
              </div>
              <div className="flex justify-between items-center text-sm py-1 border-b">
                <span>Maintenance</span>
                <span>R{formatNumber(route.maintenanceCost)}</span>
              </div>
              <div className="py-1">
                <FuelCostEditor 
                  value={vehicleConfig.fuelPrice} 
                  onUpdate={onFuelCostUpdate} 
                />
              </div>
            </>
          )}
          
          <div className="flex justify-between items-center py-1 font-medium">
            <span>Total Cost</span>
            <span className="text-lg">R{formatNumber(route.totalCost)}</span>
          </div>
        </div>
      </div>

      {/* Cylinders Information */}
      <div className="space-y-1">
        <div className="font-medium text-sm">Cylinder Load</div>
        <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
          <div className="flex justify-between items-center">
            <div>
              <div className="text-sm text-blue-800">
                {route.cylinders} of {vehicleConfig.maxCylinders} cylinders
              </div>
              <div className="text-xs text-blue-500 mt-1">
                {formatNumber(route.cylinders * vehicleConfig.cylinderWeight, 1)} kg of {formatNumber(vehicleConfig.maxCylinders * vehicleConfig.cylinderWeight, 1)} kg
              </div>
            </div>
            <div className="bg-blue-500 text-white h-10 w-10 rounded-full flex items-center justify-center font-medium">
              {route.cylinders}
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col gap-2 pt-2">
        <Button
          variant="default"
          className="w-full"
          onClick={onOptimize}
          disabled={route.locations.length < 3 || isLoadConfirmed}
        >
          Optimize Route
        </Button>
        
        <Button
          variant={isLoadConfirmed ? "secondary" : "outline"}
          className="w-full"
          onClick={onConfirmLoad}
          disabled={route.locations.length < 2}
        >
          {isLoadConfirmed ? "✓ Load Confirmed" : "Confirm Load"}
        </Button>
      </div>
    </CardContent>
  );
};

export default RouteDetails;
