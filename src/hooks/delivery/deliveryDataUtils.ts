
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DeliveryData, RouteDelivery, ProcessedRoute, FULL_LOAD_PER_SITE } from './types';

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
  
  const transformedData = transformRouteDataToDeliveries(routeDeliveries, formattedDateStr);
  
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
 * Transforms ProcessedRoute objects into flattened DeliveryData array
 */
const transformRouteDataToDeliveries = (
  routeDeliveries: ProcessedRoute[],
  formattedDateStr: string
): DeliveryData[] => {
  const transformedData: DeliveryData[] = [];
  
  routeDeliveries.forEach(route => {
    const deliveriesCount = route.deliveries.length;
    
    // Ensure we have a valid distance and distribute it properly
    const totalRouteDistance = Math.max(5.0, route.totalDistance || 0); // Minimum 5km if no distance
    const kmsPerDelivery = deliveriesCount > 0 ? totalRouteDistance / deliveriesCount : 0;
    const costPerDelivery = deliveriesCount > 0 ? route.estimatedCost / deliveriesCount : 0;
    
    // Calculate individual delivery distances based on sequence
    let previousDistance = 0;
    
    route.deliveries.forEach((delivery, index) => {
      // For the first delivery, use a portion of the total distance
      // For subsequent deliveries, use portions based on their position in the sequence
      let distanceForThisDelivery = kmsPerDelivery;
      
      // First stop is always from depot - give it more distance
      if (index === 0 && deliveriesCount > 1) {
        distanceForThisDelivery = totalRouteDistance * 0.35; // 35% of total for first leg
        previousDistance = distanceForThisDelivery;
      } 
      // Last stop might have more distance to return to depot
      else if (index === deliveriesCount - 1 && deliveriesCount > 1) {
        distanceForThisDelivery = totalRouteDistance * 0.35; // 35% of total for last leg
      }
      // Middle stops share the remaining 30% evenly
      else if (deliveriesCount > 2) {
        const remainingDistance = totalRouteDistance * 0.3;
        distanceForThisDelivery = remainingDistance / (deliveriesCount - 2);
      }
      
      const deliveryData: DeliveryData = {
        id: delivery.id,
        siteName: delivery.locationName,
        cylinders: delivery.cylinders,
        kms: parseFloat(distanceForThisDelivery.toFixed(1)),
        fuelCost: parseFloat(costPerDelivery.toFixed(2)),
        date: formattedDateStr,
        latitude: delivery.latitude,
        longitude: delivery.longitude
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
