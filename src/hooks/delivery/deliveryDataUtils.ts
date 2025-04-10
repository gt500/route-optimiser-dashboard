
import { format } from 'date-fns';
import { toast } from 'sonner';
import { DeliveryData, RouteDelivery, ProcessedRoute } from './types';

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
    const kmsPerDelivery = deliveriesCount > 0 ? route.totalDistance / deliveriesCount : 0;
    const costPerDelivery = deliveriesCount > 0 ? route.estimatedCost / deliveriesCount : 0;
    
    route.deliveries.forEach(delivery => {
      const deliveryData: DeliveryData = {
        id: delivery.id,
        siteName: delivery.locationName,
        cylinders: delivery.cylinders,
        kms: parseFloat(kmsPerDelivery.toFixed(1)),
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
