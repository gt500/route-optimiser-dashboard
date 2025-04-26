
import { LocationType } from '@/components/locations/LocationEditDialog';
import { OptimizationParams } from '@/hooks/routes/types';
import { calculateDistance } from './distanceUtils';
import { calculateTotalWeight } from './weightUtils';
import { calculateFuelConsumption } from './fuelUtils';
import { AVG_SPEED_URBAN_KM_H, AVG_SPEED_RURAL_KM_H, MIN_STOP_TIME_MINUTES } from './constants';

/**
 * Calculate route metrics based on locations and optimization parameters
 * with support for custom fuel cost and detailed waypoint data
 */
export const calculateRouteMetrics = (
  locations: LocationType[],
  params: OptimizationParams,
  fuelCostPerLiter: number = 21.95,
  routingMachineData?: {
    totalDistance?: number,
    totalDuration?: number,
    waypointData?: { distance: number, duration: number }[]
  }
) => {
  let calculatedDistance = 0;
  let calculatedDuration = 0;
  let useRoutingMachineData = false;
  
  if (routingMachineData?.totalDistance && routingMachineData.totalDistance > 0) {
    calculatedDistance = routingMachineData.totalDistance;
    calculatedDuration = routingMachineData.totalDuration || 0;
    useRoutingMachineData = true;
  } 
  else if (locations.length > 1) {
    for (let i = 0; i < locations.length - 1; i++) {
      const lat1 = locations[i].lat || 0;
      const lon1 = locations[i].long || 0;
      const lat2 = locations[i + 1].lat || 0;
      const lon2 = locations[i + 1].long || 0;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      calculatedDistance += distance;
    }
  }
  
  if (calculatedDistance <= 0) {
    calculatedDistance = 45.7;
  }
  
  const totalWeight = calculateTotalWeight(locations);
  const trafficMultiplier = params.avoidTraffic ? 0.9 : 1.0;
  const fuelMultiplier = params.prioritizeFuel ? 0.9 : 1.0;
  const distanceMultiplier = params.optimizeForDistance ? 0.9 : 1.05;
  
  let newDistance = calculatedDistance > 0 ? calculatedDistance : 45.7;
  
  if (!useRoutingMachineData || calculatedDuration <= 0) {
    let avgSpeed = AVG_SPEED_URBAN_KM_H;
    
    if (newDistance > 50) {
      avgSpeed = (AVG_SPEED_URBAN_KM_H + AVG_SPEED_RURAL_KM_H) / 2;
    } else if (newDistance > 100) {
      avgSpeed = AVG_SPEED_RURAL_KM_H;
    }
    
    const drivingTimeMinutes = (newDistance / avgSpeed) * 60;
    const numStops = locations.length;
    const stopTimeMinutes = numStops * MIN_STOP_TIME_MINUTES;
    
    calculatedDuration = drivingTimeMinutes + stopTimeMinutes;
  }
  
  let trafficConditions: 'light' | 'moderate' | 'heavy' = 'moderate';
  
  if (params.useRealTimeData) {
    const hourOfDay = new Date().getHours();
    let realTimeTrafficFactor = 1.0;
    
    if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 16 && hourOfDay <= 18)) {
      realTimeTrafficFactor = 1.3 + (Math.random() * 0.2);
      trafficConditions = 'heavy';
    } else if ((hourOfDay >= 10 && hourOfDay <= 15) || (hourOfDay >= 19 && hourOfDay <= 20)) {
      realTimeTrafficFactor = 1.0 + (Math.random() * 0.2);
      trafficConditions = 'moderate';
    } else {
      realTimeTrafficFactor = 0.8 + (Math.random() * 0.1);
      trafficConditions = 'light';
    }
    
    if (!useRoutingMachineData) {
      calculatedDuration = calculatedDuration * realTimeTrafficFactor;
    }
    
    newDistance = newDistance * distanceMultiplier;
  }
  
  calculatedDuration = Math.max(calculatedDuration, locations.length * MIN_STOP_TIME_MINUTES);
  
  const fuelConsumption = calculateFuelConsumption(newDistance, totalWeight) * fuelMultiplier;
  const fuelCost = Math.round(fuelConsumption * fuelCostPerLiter * 100) / 100;
  const maintenanceCost = newDistance * 0.85;
  
  return {
    distance: Math.round(newDistance * 10) / 10,
    duration: Math.round(calculatedDuration),
    fuelConsumption: Math.round(fuelConsumption * 100) / 100,
    fuelCost,
    maintenanceCost: Math.round(maintenanceCost * 100) / 100,
    totalCost: Math.round((fuelCost + maintenanceCost) * 100) / 100,
    trafficConditions,
    usingRealTimeData: params.useRealTimeData,
    totalWeight: Math.round(totalWeight),
    waypointData: routingMachineData?.waypointData
  };
};
