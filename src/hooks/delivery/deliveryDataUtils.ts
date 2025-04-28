
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DeliveryData, RouteDelivery, ProcessedRoute, FULL_LOAD_PER_SITE } from './types';
import { calculateDistance } from '@/utils/route/distanceUtils';

/**
 * Processes delivery data from Supabase into a structured format
 */
export const processDeliveryData = (
  routesData: any[],
  deliveriesData: any[],
  locationsData: any[],
  formattedDateStr: string,
  includeRegionCountry: boolean
): DeliveryData[] => {
  const locationsMap = locationsData.reduce((acc: Record<string, any>, location) => {
    acc[location.id] = location;
    return acc;
  }, {});
  
  const routeDeliveries = mapRoutesToDeliveries(routesData, deliveriesData, locationsMap, includeRegionCountry);
  
  console.log('Processed route deliveries:', routeDeliveries.length);
  
  const transformedData = transformRouteDataToDeliveries(routeDeliveries, formattedDateStr, locationsMap);
  
  console.log('Final transformed data:', transformedData.length);
  
  if (transformedData.length > 0) {
    toast.success(`Loaded ${transformedData.length} deliveries for ${formattedDateStr}`);
  } else {
    toast.info(`No deliveries found for ${formattedDateStr}`);
  }
  
  return transformedData;
};

/**
 * Determines if a delivery is a full load based on cylinder count
 * A full load is defined as 20 or more cylinders per site
 */
export const isFullLoad = (cylinders: number): boolean => {
  return cylinders >= FULL_LOAD_PER_SITE;
};

/**
 * Maps raw route and delivery data to structured RouteDelivery objects
 */
const mapRoutesToDeliveries = (
  routesData: any[],
  deliveriesData: any[],
  locationsMap: Record<string, any>,
  includeRegionCountry: boolean
): ProcessedRoute[] => {
  return routesData.map(route => {
    const routeDeliveries = deliveriesData
      .filter(delivery => delivery.route_id === route.id)
      .map(delivery => {
        const location = locationsMap[delivery.location_id];
        if (includeRegionCountry) {
          return {
            id: delivery.id,
            locationName: location?.name || 'Unknown Location',
            cylinders: delivery.cylinders,
            sequence: delivery.sequence,
            latitude: location?.latitude,
            longitude: location?.longitude,
            region: location?.region,
            country: location?.country
          };
        } else {
          return {
            id: delivery.id,
            locationName: location?.name || 'Unknown Location',
            cylinders: delivery.cylinders,
            sequence: delivery.sequence,
            latitude: location?.latitude,
            longitude: location?.longitude
          };
        }
      })
      .sort((a, b) => (a.sequence || 0) - (b.sequence || 0));
      
    return {
      routeId: route.id,
      routeName: route.name,
      date: route.date,
      totalDistance: route.total_distance || 0,
      totalDuration: route.total_duration || 0,
      estimatedCost: route.estimated_cost || 0,
      deliveries: routeDeliveries,
      totalCylinders: route.total_cylinders || 0
    };
  });
};

/**
 * Calculate realistic distances between locations based on road network
 */
const calculateRealisticDistances = (
  locations: any[],
  totalRouteDistance: number
): { distances: number[], totalCalculated: number } => {
  let distances: number[] = [];
  let totalCalculated = 0;
  
  // If we don't have enough locations or a total route distance
  if (locations.length <= 1 || totalRouteDistance <= 0) {
    return { distances: [0], totalCalculated: 0 };
  }

  // First calculate direct distances between consecutive locations
  for (let i = 0; i < locations.length - 1; i++) {
    const current = locations[i];
    const next = locations[i + 1];
    
    if (!current.latitude || !current.longitude || !next.latitude || !next.longitude) {
      // If location data is missing, use an average distance
      distances.push(Math.max(5, totalRouteDistance / (locations.length - 1)));
      continue;
    }
    
    // Calculate direct distance and apply road correction factors
    const directDistance = calculateDistance(
      current.latitude,
      current.longitude,
      next.latitude,
      next.longitude
    );
    
    // Apply more aggressive road correction factors for realistic distances
    // Rural/highway routes have significantly more circuitous paths than direct lines
    let roadFactor = 1.3; // Default urban road factor
    
    // Calculate distance to determine road type (rough estimation)
    if (directDistance > 15) {
      roadFactor = 1.5; // Highway/rural routes with more detours
    } else if (directDistance > 5) {
      roadFactor = 1.4; // Suburban routes
    }
    
    const roadDistance = directDistance * roadFactor;
    distances.push(roadDistance);
    totalCalculated += roadDistance;
  }
  
  // If we have a precise route distance and it's significantly different from our calculation,
  // proportionally scale all segments to match the known total
  if (totalRouteDistance > 0 && totalCalculated > 0 && 
      (totalCalculated < totalRouteDistance * 0.8 || totalCalculated > totalRouteDistance * 1.2)) {
    const scaleFactor = totalRouteDistance / totalCalculated;
    distances = distances.map(d => d * scaleFactor);
    totalCalculated = totalRouteDistance;
  }
  
  return { distances, totalCalculated };
};

/**
 * Transforms ProcessedRoute objects into flattened DeliveryData array
 */
const transformRouteDataToDeliveries = (
  routeDeliveries: ProcessedRoute[],
  formattedDateStr: string,
  locationsMap: Record<string, any>
): DeliveryData[] => {
  const transformedData: DeliveryData[] = [];
  
  routeDeliveries.forEach(route => {
    const deliveriesCount = route.deliveries.length;
    if (deliveriesCount === 0) return;
    
    // Ensure we have a valid distance and distribute it properly
    const totalRouteDistance = Math.max(5.0, route.totalDistance || 0); // Minimum 5km if no distance
    const costPerKm = totalRouteDistance > 0 ? route.estimatedCost / totalRouteDistance : 15.0;
    
    // Extract location data for distance calculations
    const locationData = route.deliveries.map(delivery => ({
      latitude: delivery.latitude,
      longitude: delivery.longitude
    }));
    
    // Calculate realistic segment distances
    const { distances } = calculateRealisticDistances(locationData, totalRouteDistance);
    
    // Calculate individual delivery distances based on sequence
    route.deliveries.forEach((delivery, index) => {
      // Get the distance for this segment (default to minimum if not available)
      let distanceForThisDelivery = index < distances.length ? 
        distances[index] : 
        Math.max(5.0, totalRouteDistance / deliveriesCount);
        
      // Minimum realistic distance
      if (distanceForThisDelivery < 0.5) distanceForThisDelivery = 0.5;
      
      // Calculate fuel cost based on distance
      const segmentFuelCost = distanceForThisDelivery * costPerKm;
      
      const deliveryData: DeliveryData = {
        id: delivery.id,
        siteName: delivery.locationName,
        cylinders: delivery.cylinders,
        kms: parseFloat(distanceForThisDelivery.toFixed(1)),
        fuelCost: parseFloat(segmentFuelCost.toFixed(2)),
        date: formattedDateStr,
        latitude: delivery.latitude,
        longitude: delivery.longitude,
        actualDistance: parseFloat(distanceForThisDelivery.toFixed(1))
      };
      
      // Only add region and country if available
      if ('region' in delivery && 'country' in delivery) {
        deliveryData.region = delivery.region;
        deliveryData.country = delivery.country;
      }
      
      transformedData.push(deliveryData);
    });
  });
  
  return transformedData;
};
