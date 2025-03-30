
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { LocationType } from '../locations/LocationEditDialog';
import RouteMetricsGrid from './metrics/RouteMetricsGrid';
import RouteStopsList from './stops/RouteStopsList';
import RouteActions from './RouteActions';

interface RouteDetailsProps {
  route: {
    distance: number;
    fuelConsumption: number;
    fuelCost: number;
    cylinders: number;
    locations: LocationType[];
    availableLocations: LocationType[];
    estimatedDuration?: number;
    trafficConditions?: 'light' | 'moderate' | 'heavy';
    usingRealTimeData?: boolean;
  };
  onRemoveLocation: (index: number) => void;
  onAddNewLocation: (locationId: number | string) => void;
  onFuelCostUpdate?: (newFuelCost: number) => void;
  onRouteDataUpdate?: (distance: number, duration: number) => void;
  onOptimize?: () => void;
  onSave?: () => void;
  isLoadConfirmed?: boolean;
}

const RouteDetails: React.FC<RouteDetailsProps> = ({ 
  route, 
  onRemoveLocation, 
  onAddNewLocation, 
  onFuelCostUpdate,
  onRouteDataUpdate,
  onOptimize,
  onSave,
  isLoadConfirmed = false
}) => {
  const [fuelCostPerLiter, setFuelCostPerLiter] = useState(22); // Default value
  const [routeDistance, setRouteDistance] = useState(route.distance);
  const [routeDuration, setRouteDuration] = useState(route.estimatedDuration || 0);
  
  useEffect(() => {
    if (route.distance > 0) {
      setRouteDistance(route.distance);
    }
    if (route.estimatedDuration && route.estimatedDuration > 0) {
      setRouteDuration(route.estimatedDuration);
    }
  }, [route.distance, route.estimatedDuration]);
  
  useEffect(() => {
    const fetchFuelCost = async () => {
      const { data, error } = await supabase
        .from('cost_factors')
        .select('value')
        .eq('name', 'fuel_cost_per_liter')
        .single();
      
      if (error) {
        console.error('Error fetching fuel cost:', error);
        return;
      }
      
      if (data) {
        setFuelCostPerLiter(data.value);
        if (onFuelCostUpdate) {
          onFuelCostUpdate(data.value);
        }
      }
    };
    
    fetchFuelCost();
  }, [onFuelCostUpdate]);

  const handleFuelCostChange = (newCost: number) => {
    setFuelCostPerLiter(newCost);
    if (onFuelCostUpdate) {
      onFuelCostUpdate(newCost);
    }
  };
  
  const calculateFuelConsumption = () => {
    return routeDistance * 0.12; // 12L per 100km
  };
  
  const calculateFuelCost = () => {
    const consumption = calculateFuelConsumption();
    return consumption * fuelCostPerLiter;
  };
  
  const displayDistance = routeDistance > 0 ? routeDistance : route.distance;
  const displayDuration = routeDuration > 0 ? routeDuration : (route.estimatedDuration || Math.round(displayDistance * 1.5));
  const displayConsumption = calculateFuelConsumption() || route.fuelConsumption;
  const displayFuelCost = calculateFuelCost() || route.fuelCost;
  
  return (
    <div className="space-y-4">
      <RouteMetricsGrid
        distance={displayDistance}
        duration={displayDuration}
        fuelConsumption={displayConsumption}
        fuelCost={displayFuelCost}
        cylinders={route.cylinders}
        fuelCostPerLiter={fuelCostPerLiter}
        trafficConditions={route.trafficConditions}
        usingRealTimeData={route.usingRealTimeData}
        onFuelCostChange={handleFuelCostChange}
      />

      <RouteStopsList
        locations={route.locations}
        availableLocations={route.availableLocations}
        onRemoveLocation={onRemoveLocation}
        onAddNewLocation={onAddNewLocation}
      />
      
      <RouteActions
        usingRealTimeData={route.usingRealTimeData}
        onOptimize={onOptimize}
        onSave={onSave}
        disabled={isLoadConfirmed || route.locations.length < 2}
      />
    </div>
  );
};

export default RouteDetails;
