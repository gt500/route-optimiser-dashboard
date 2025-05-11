
import { LocationType } from '@/components/locations/LocationEditDialog';
import { OptimizationParams } from '@/hooks/routes/types';
import { calculateDistance } from './distanceUtils';
import { calculateTotalWeight } from './weightUtils';
import { calculateRouteFuelConsumption } from './fuelUtils';
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
  let waypointDataModified: { distance: number; duration: number }[] = [];
  
  if (routingMachineData?.totalDistance && routingMachineData.totalDistance > 0) {
    calculatedDistance = routingMachineData.totalDistance;
    calculatedDuration = routingMachineData.totalDuration || 0;
    useRoutingMachineData = true;
    
    // Clone the waypoint data to avoid modifying the original
    if (routingMachineData.waypointData && routingMachineData.waypointData.length > 0) {
      waypointDataModified = [...routingMachineData.waypointData];
    }
  } 
  else if (locations.length > 1) {
    waypointDataModified = [{ distance: 0, duration: 0 }]; // First point has zero distance/duration
    
    for (let i = 0; i < locations.length - 1; i++) {
      const lat1 = locations[i].lat || 0;
      const lon1 = locations[i].long || 0;
      const lat2 = locations[i + 1].lat || 0;
      const lon2 = locations[i + 1].long || 0;
      
      const distance = calculateDistance(lat1, lon1, lat2, lon2);
      calculatedDistance += distance;
      
      // Calculate segment duration based on distance
      const avgSpeed = i % 2 === 0 ? AVG_SPEED_URBAN_KM_H : AVG_SPEED_RURAL_KM_H;
      const drivingTimeMinutes = (distance / avgSpeed) * 60;
      const stopTimeMinutes = MIN_STOP_TIME_MINUTES;
      const totalSegmentTime = Math.max(1, drivingTimeMinutes) + stopTimeMinutes;
      
      calculatedDuration += totalSegmentTime;
      
      // Add this segment's data to our waypoint data
      if (i > 0) {
        waypointDataModified.push({
          distance: Math.max(0.1, distance),
          duration: Math.max(1, totalSegmentTime)
        });
      }
    }
  }
  
  // Set minimum default values if we have no data
  if (calculatedDistance <= 0) {
    calculatedDistance = 0.1;
  }
  
  if (calculatedDuration <= 0) {
    calculatedDuration = locations.length * MIN_STOP_TIME_MINUTES;
  }
  
  const totalWeight = calculateTotalWeight(locations);
  const trafficMultiplier = params.avoidTraffic ? 0.9 : 1.0;
  const fuelMultiplier = params.prioritizeFuel ? 0.9 : 1.0;
  const distanceMultiplier = params.optimizeForDistance ? 0.9 : 1.05;
  
  // Apply optimization parameters
  let finalDistance = calculatedDistance * distanceMultiplier;
  
  // Adjust for real-time traffic conditions
  let trafficConditions: 'light' | 'moderate' | 'heavy' = 'moderate';
  
  if (params.useRealTimeData) {
    const hourOfDay = new Date().getHours();
    let realTimeTrafficFactor = 1.0;
    
    if ((hourOfDay >= 7 && hourOfDay <= 9) || (hourOfDay >= 16 && hourOfDay <= 18)) {
      realTimeTrafficFactor = 1.2;
      trafficConditions = 'heavy';
    } else if ((hourOfDay >= 10 && hourOfDay <= 15) || (hourOfDay >= 19 && hourOfDay <= 20)) {
      realTimeTrafficFactor = 1.0;
      trafficConditions = 'moderate';
    } else {
      realTimeTrafficFactor = 0.85;
      trafficConditions = 'light';
    }
    
    if (!useRoutingMachineData) {
      calculatedDuration = calculatedDuration * realTimeTrafficFactor;
    }
  }
  
  // Ensure we have minimum values
  calculatedDuration = Math.max(calculatedDuration, locations.length * MIN_STOP_TIME_MINUTES);
  finalDistance = Math.max(0.1, finalDistance);
  
  // Calculate fuel consumption and costs
  const fuelConsumption = calculateRouteFuelConsumption(finalDistance, locations) * fuelMultiplier;
  const fuelCost = Math.max(0, fuelConsumption * fuelCostPerLiter);
  const maintenanceCost = finalDistance * 0.85;
  
  return {
    distance: Math.max(0.1, Math.round(finalDistance * 10) / 10),
    duration: Math.max(1, Math.round(calculatedDuration)),
    fuelConsumption: Math.max(0, Math.round(fuelConsumption * 100) / 100),
    fuelCost: Math.round(fuelCost * 100) / 100,
    maintenanceCost: Math.round(maintenanceCost * 100) / 100,
    totalCost: Math.round((fuelCost + maintenanceCost) * 100) / 100,
    trafficConditions,
    usingRealTimeData: params.useRealTimeData,
    totalWeight: Math.round(totalWeight),
    waypointData: waypointDataModified
  };
};
