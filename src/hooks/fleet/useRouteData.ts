
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { format, subDays } from 'date-fns';
import { toast } from 'sonner';

export interface RouteStop {
  id: string;
  location_id: string;
  location_name?: string;
  cylinders: number;
  sequence: number;
  distance?: number;
  fuel_cost?: number;
}

export interface RouteData {
  id: string;
  name: string;
  date: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  total_distance?: number;
  total_cylinders: number;
  total_duration?: number;
  estimated_cost?: number;
  vehicle_id?: string;
  vehicle_name?: string;
  stops?: RouteStop[];
  region?: string;
  country?: string;
}

export const useRouteData = () => {
  const [isLoading, setIsLoading] = useState(false);

  // Get historical routes (completed or cancelled)
  const fetchRouteHistory = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id, name, date, status, 
          total_distance, total_cylinders, 
          total_duration, estimated_cost, 
          vehicle_id, region, country
        `)
        .or('status.eq.completed,status.eq.cancelled')
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching route history:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get vehicle information for routes that have vehicles assigned
      const routesWithVehicleIds = data.filter(route => route.vehicle_id);
      const vehicles = await getVehicleData(routesWithVehicleIds.map(route => route.vehicle_id).filter(Boolean) as string[]);
      
      // Add vehicle_name to routes
      const routesWithVehicleInfo = data.map(route => {
        if (route.vehicle_id) {
          const vehicle = vehicles.find(v => v.id === route.vehicle_id);
          return {
            ...route,
            vehicle_name: vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : route.vehicle_id
          };
        }
        return route;
      });
      
      return routesWithVehicleInfo as RouteData[];
    } catch (error) {
      console.error('Error in fetchRouteHistory:', error);
      toast.error('Failed to load route history');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get active routes (scheduled or in_progress)
  const fetchActiveRoutes = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id, name, date, status, 
          total_distance, total_cylinders, 
          total_duration, estimated_cost, 
          vehicle_id, region, country
        `)
        .or('status.eq.scheduled,status.eq.in_progress')
        .order('date', { ascending: true });
        
      if (error) {
        console.error('Error fetching active routes:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        return [];
      }
      
      // Get all deliveries for these routes
      const { data: deliveriesData, error: deliveriesError } = await supabase
        .from('deliveries')
        .select(`
          id, route_id, location_id, cylinders, sequence
        `)
        .in('route_id', data.map(route => route.id));
        
      if (deliveriesError) {
        console.error('Error fetching deliveries:', deliveriesError);
      }
      
      // Get all location IDs from deliveries
      const locationIds = deliveriesData ? 
        [...new Set(deliveriesData.map(d => d.location_id))] : [];
      
      // Get location data for all locations
      const { data: locationsData, error: locationsError } = await supabase
        .from('locations')
        .select(`id, name`)
        .in('id', locationIds);
        
      if (locationsError) {
        console.error('Error fetching locations:', locationsError);
      }
      
      // Get vehicle information for routes that have vehicles assigned
      const routesWithVehicleIds = data.filter(route => route.vehicle_id);
      const vehicles = await getVehicleData(routesWithVehicleIds.map(route => route.vehicle_id).filter(Boolean) as string[]);
      
      // Map locations to deliveries
      const deliveriesWithLocationNames = deliveriesData?.map(delivery => {
        const location = locationsData?.find(loc => loc.id === delivery.location_id);
        return {
          ...delivery,
          location_name: location ? location.name : 'Unknown Location'
        };
      });
      
      // Group deliveries by route
      const deliveriesByRoute: Record<string, RouteStop[]> = {};
      
      deliveriesWithLocationNames?.forEach(delivery => {
        if (!deliveriesByRoute[delivery.route_id]) {
          deliveriesByRoute[delivery.route_id] = [];
        }
        deliveriesByRoute[delivery.route_id].push(delivery as RouteStop);
      });
      
      // Add stops and vehicle_name to routes
      const routesWithStops = data.map(route => {
        // Find vehicle info if available
        const vehicle = route.vehicle_id ? 
          vehicles.find(v => v.id === route.vehicle_id) : null;
        
        return {
          ...route,
          stops: deliveriesByRoute[route.id] || [],
          vehicle_name: vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : null
        };
      });
      
      return routesWithStops as RouteData[];
    } catch (error) {
      console.error('Error in fetchActiveRoutes:', error);
      toast.error('Failed to load active routes');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  // Get all route data (regardless of status)
  const fetchRouteData = async () => {
    try {
      const { data, error } = await supabase
        .from('routes')
        .select(`
          id, name, date, status, 
          total_distance, total_cylinders, 
          total_duration, estimated_cost, 
          vehicle_id, region, country
        `)
        .order('date', { ascending: false });
        
      if (error) {
        console.error('Error fetching route data:', error);
        throw error;
      }
      
      // Get vehicle information for routes that have vehicles assigned
      const routesWithVehicleIds = data.filter(route => route.vehicle_id);
      const vehicles = await getVehicleData(routesWithVehicleIds.map(route => route.vehicle_id).filter(Boolean) as string[]);
      
      // Add vehicle_name to routes
      const routesWithVehicleInfo = data.map(route => {
        if (route.vehicle_id) {
          const vehicle = vehicles.find(v => v.id === route.vehicle_id);
          return {
            ...route,
            vehicle_name: vehicle ? `${vehicle.name} (${vehicle.licensePlate})` : route.vehicle_id
          };
        }
        return route;
      });
      
      return routesWithVehicleInfo as RouteData[];
    } catch (error) {
      console.error('Error in fetchRouteData:', error);
      toast.error('Failed to load route data');
      return [];
    }
  };

  // Helper function to get vehicle data
  const getVehicleData = async (vehicleIds: string[]) => {
    if (vehicleIds.length === 0) return [];
    
    try {
      // This is a mock function since we don't have direct database access to vehicles
      // In a real implementation, you would query the database for vehicle data
      
      const { data: mockVehicles } = await supabase
        .from('routes')
        .select('vehicle_id')
        .in('vehicle_id', vehicleIds)
        .limit(1);
      
      // Return mock vehicle data for the IDs
      return vehicleIds.map(id => ({
        id,
        name: id === 'TRK-001' ? 'Leyland Phoenix' : 'Leyland Phoenix',
        licensePlate: id === 'TRK-001' ? 'CA 123-456' : 'CA 789-012'
      }));
    } catch (error) {
      console.error('Error fetching vehicle data:', error);
      return [];
    }
  };

  return {
    isLoading,
    fetchRouteHistory,
    fetchActiveRoutes,
    fetchRouteData
  };
};

export default useRouteData;
