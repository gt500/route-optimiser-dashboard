import { LocationInfo, LocationType } from '@/types/location';
import { calculateDistance } from './distanceUtils';
import { getCurrentTrafficCondition } from './trafficUtils';
import { supabase } from "@/integrations/supabase/client";

/**
 * Calculate realistic driving distances between coordinates using direct distance with road correction factors
 * or API data when available
 */
export const calculateSegmentDistance = (
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number
): number => {
  // Calculate direct distance
  const directDistance = calculateDistance(fromLat, fromLng, toLat, toLng);
  
  // Apply road correction factors based on distance ranges
  let roadFactor = 1.3; // Default urban correction factor
  
  if (directDistance > 20) {
    // Long distance routes tend to use highways with less detours
    roadFactor = 1.2;
  } else if (directDistance > 10) {
    // Medium distance with mix of roads
    roadFactor = 1.25;
  } else if (directDistance < 2) {
    // Very short urban trips often involve more detours
    roadFactor = 1.6;
  }
  
  // Add slight variability to make different segments unique
  const variability = 0.9 + (Math.random() * 0.2);
  return directDistance * roadFactor * variability;
};

/**
 * Calculate driving time based on distance, traffic conditions and road type
 */
export const calculateSegmentDuration = (
  distanceKm: number,
  trafficCondition: 'light' | 'moderate' | 'heavy' = 'moderate'
): number => {
  // Base speeds (km/h) for different traffic conditions
  const speedsByTraffic = {
    light: 60,
    moderate: 45,
    heavy: 30
  };
  
  // Adjust speed based on distance (approximation of road type)
  let baseSpeed = speedsByTraffic[trafficCondition];
  
  // Longer distances typically involve highways (faster)
  if (distanceKm > 20) {
    baseSpeed *= 1.3;
  } 
  // Very short distances typically involve city streets (slower)
  else if (distanceKm < 5) {
    baseSpeed *= 0.8;
  }
  
  // Add variability to each segment
  const variability = 0.9 + (Math.random() * 0.2);
  baseSpeed *= variability;
  
  // Calculate time in hours then convert to minutes
  const timeHours = distanceKm / baseSpeed;
  const timeMinutes = timeHours * 60;
  
  // Add stop time (loading/unloading)
  const stopTime = 5;
  
  return Math.max(stopTime, Math.round(timeMinutes));
};

/**
 * Calculate complete route metrics between multiple locations
 */
export const calculateRouteMetrics = async (
  locations: LocationInfo[],
  useRealTimeData: boolean = true,
  routeName?: string
): Promise<{
  totalDistance: number;
  totalDuration: number;
  segments: { distance: number; duration: number }[];
  trafficConditions: 'light' | 'moderate' | 'heavy';
}> => {
  // Default response with empty data
  const defaultResponse = {
    totalDistance: 0,
    totalDuration: 0,
    segments: [],
    trafficConditions: 'moderate' as 'light' | 'moderate' | 'heavy'
  };
  
  // Need at least 2 locations to calculate a route
  if (!locations || locations.length < 2) {
    return defaultResponse;
  }
  
  console.log(`Calculating route metrics for ${locations.length} locations, useRealTimeData: ${useRealTimeData}`);
  
  try {
    // Attempt to get route data from the Supabase edge function
    if (useRealTimeData) {
      try {
        // Sanitize and validate waypoint data
        const waypoints = locations.map(loc => ({
          latitude: Number(loc.latitude),
          longitude: Number(loc.longitude)
        })).filter(wp => !isNaN(wp.latitude) && !isNaN(wp.longitude));
        
        // Don't proceed if we don't have enough valid waypoints
        if (waypoints.length < 2) {
          console.warn('Not enough valid waypoints for route calculation');
          throw new Error('Invalid waypoint data');
        }
        
        // Sanitize route name
        const sanitizedRouteName = routeName?.trim() || '';
        
        const { data, error } = await supabase.functions.invoke('calculate-route', {
          body: { 
            waypoints, 
            routeName: sanitizedRouteName
          },
          headers: {
            'Content-Type': 'application/json'
          }
        });
        
        if (error) {
          console.error('Error from calculate-route function:', error);
          throw error;
        }
        
        if (data && data.distance && data.duration) {
          console.log('Received route data from edge function:', data);
          
          // Ensure trafficConditions is one of the allowed values
          const validTrafficCondition: 'light' | 'moderate' | 'heavy' = 
            data.trafficConditions === 'light' ? 'light' : 
            data.trafficConditions === 'heavy' ? 'heavy' : 'moderate';
          
          return {
            totalDistance: Number(data.distance) || 0,
            totalDuration: Number(data.duration) || 0,
            segments: Array.isArray(data.waypointData) ? data.waypointData : [],
            trafficConditions: validTrafficCondition
          };
        }
      } catch (err) {
        console.error('Failed to get route data from edge function:', err);
        // Fall back to local calculation
      }
    }
    
    // Local calculation if API fails or real-time data not requested
    const segments: { distance: number; duration: number }[] = [];
    let totalDistance = 0;
    let totalDuration = 0;
    
    // Get current traffic conditions
    const trafficConditions = getCurrentTrafficCondition();
    
    // First waypoint has zero distance/duration
    segments.push({ distance: 0, duration: 0 });
    
    // Calculate metrics for each segment
    for (let i = 0; i < locations.length - 1; i++) {
      const fromLoc = locations[i];
      const toLoc = locations[i + 1];
      
      const segmentDistance = calculateSegmentDistance(
        fromLoc.latitude,
        fromLoc.longitude,
        toLoc.latitude,
        toLoc.longitude
      );
      
      const segmentDuration = calculateSegmentDuration(
        segmentDistance,
        trafficConditions
      );
      
      if (i > 0) { // Skip the first point which is already added
        segments.push({
          distance: segmentDistance,
          duration: segmentDuration
        });
      }
      
      totalDistance += segmentDistance;
      totalDuration += segmentDuration;
    }
    
    console.log(`Calculated route metrics: distance=${totalDistance.toFixed(1)}km, duration=${totalDuration}min, segments=${segments.length}, traffic=${trafficConditions}`);
    
    return {
      totalDistance,
      totalDuration,
      segments,
      trafficConditions
    };
  } catch (error) {
    console.error('Error in calculateRouteMetrics:', error);
    return defaultResponse;
  }
};

/**
 * Format duration in minutes to a human-readable string
 */
export const formatDuration = (minutes: number): string => {
  if (minutes < 60) return `${minutes} min`;
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}min`;
};
