
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';
import { toast } from 'sonner';

interface RouteOptions {
  routeColor?: string;
  routeWeight?: number;
  alternateRoutes?: boolean;
  avoidTraffic?: boolean;
  useRealTimeData?: boolean;
  includeSegmentDurations?: boolean;
}

interface RoutingMachineProps {
  waypoints: L.LatLng[];
  forceRouteUpdate?: boolean;
  onRouteFound?: (route: {
    distance: number;
    duration: number;
    coordinates: [number, number][];
    waypoints?: { distance: number; duration: number }[];
    segmentDurations?: number[];
    trafficConditions?: 'light' | 'moderate' | 'heavy';
  }) => void;
  routeOptions?: RouteOptions;
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ 
  waypoints = [], 
  forceRouteUpdate, 
  onRouteFound,
  routeOptions = { 
    avoidTraffic: true, 
    alternateRoutes: false, 
    useRealTimeData: true,
    routeColor: '#6366F1',
    routeWeight: 6,
    includeSegmentDurations: true
  }
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) {
      console.log("Not enough waypoints or map not ready:", waypoints);
      return;
    }
    
    console.log("Creating route with waypoints:", waypoints);
    
    let routingControl: L.Routing.Control | null = null;
    
    const createRoute = () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
      
      try {
        // Ensure all waypoints are valid LatLng objects with extra validation
        const validWaypoints = waypoints.filter(wp => {
          // Extra checks to ensure valid latitude and longitude
          if (!wp || typeof wp.lat !== 'function' || typeof wp.lng !== 'function') {
            return false;
          }
          
          const lat = wp.lat();
          const lng = wp.lng();
          
          return (
            lat !== undefined && lng !== undefined &&
            !isNaN(lat) && !isNaN(lng) && 
            lat !== 0 && lng !== 0 &&
            Math.abs(lat) <= 90 && Math.abs(lng) <= 180
          );
        });
        
        if (validWaypoints.length < 2) {
          console.log("Not enough valid waypoints to create route:", validWaypoints);
          return;
        }
        
        console.log("Creating route with valid waypoints:", validWaypoints);
        
        // Always enable real-time traffic data by default for maximum efficiency
        const useRealTimeTraffic = routeOptions.useRealTimeData !== false;
        
        // Extract styling options from routeOptions or use defaults
        const routeColor = routeOptions.routeColor || '#6366F1';
        const routeWeight = routeOptions.routeWeight || 6;
        
        // Configure options with real-time traffic preferences
        const routerOptions: L.Routing.RoutingControlOptions = {
          router: L.Routing.osrm({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving', // Use driving profile for road-based routing
            useHints: false, // Disable hints for more accurate real-time routing
            suppressDemoServerWarning: true,
            urlParameters: {
              // Always optimize for traffic avoidance
              alternatives: routeOptions.alternateRoutes ? 'true' : 'false',
              steps: 'true',
              geometries: 'geojson',
              overview: 'full',
              annotations: 'true',
              // Always use real-time traffic data when available
              traffic: useRealTimeTraffic ? 'true' : 'false'
            }
          }),
          waypoints: validWaypoints,
          lineOptions: {
            styles: [
              { color: routeColor, weight: routeWeight, opacity: 0.7 },
              { color: '#FFFFFF', weight: routeWeight - 2, opacity: 0.5, dashArray: '5,10' } // Add a dashed white line in the middle
            ],
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: true,
          showAlternatives: routeOptions.alternateRoutes,
          show: false
        };
        
        routingControl = L.Routing.control(routerOptions).addTo(map);
        
        // Hide the routing control UI but show the route path
        routingControl.hide();
        
        // Define handleRoute function inside the useEffect
        const handleRoute = (e: L.Routing.RoutingResultEvent) => {
          const routes = e.routes;
          if (routes && routes.length > 0 && onRouteFound) {
            const selectedRoute = routes[0];
            
            // Extract coordinates from the route
            const coordinates: [number, number][] = selectedRoute.coordinates.map(coord => 
              [coord.lat, coord.lng]
            );
            
            // Extract waypoint data if available
            const waypoints = selectedRoute.waypoints?.map(wp => ({
              distance: wp.distance || 0,
              duration: wp.duration || 0
            }));
            
            // Extract segment durations if enabled and available
            const segmentDurations = routeOptions.includeSegmentDurations && 
              selectedRoute.instructions ? 
              selectedRoute.instructions.map(instr => instr.time || 0) : 
              undefined;
            
            // Determine traffic conditions based on average speed
            let trafficConditions: 'light' | 'moderate' | 'heavy' | undefined = undefined;
            
            if (selectedRoute.summary.totalDistance && selectedRoute.summary.totalTime) {
              const avgSpeedKmh = (selectedRoute.summary.totalDistance / 1000) / (selectedRoute.summary.totalTime / 3600);
              
              if (avgSpeedKmh > 60) trafficConditions = 'light';
              else if (avgSpeedKmh > 35) trafficConditions = 'moderate';
              else trafficConditions = 'heavy';
              
              console.log(`Average route speed: ${avgSpeedKmh.toFixed(1)} km/h (${trafficConditions} traffic)`);
            }
            
            // Log detailed segment information for debugging
            if (selectedRoute.instructions && selectedRoute.instructions.length > 0) {
              console.log("Route segments:", selectedRoute.instructions.map(instr => ({
                road: instr.road,
                direction: instr.direction,
                distance: (instr.distance / 1000).toFixed(1) + " km",
                time: Math.round(instr.time / 60) + " min"
              })));
            }
            
            // Format route data for displaying to user
            console.log(`Route found: ${(selectedRoute.summary.totalDistance / 1000).toFixed(1)}km, ${Math.round(selectedRoute.summary.totalTime / 60)}min`);
            
            onRouteFound({
              distance: selectedRoute.summary.totalDistance / 1000,
              duration: selectedRoute.summary.totalTime / 60,
              coordinates,
              waypoints,
              segmentDurations,
              trafficConditions
            });
          }
        };
        
        // Extract route information when a route is found
        routingControl.on('routesfound', handleRoute);
      } catch (error) {
        console.error("Error creating routing control:", error);
        toast.error("Error generating route with traffic data");
      }
    };
    
    createRoute();
    
    return () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
    };
  }, [map, waypoints, forceRouteUpdate, onRouteFound, routeOptions]);
  
  return null;
};

export default RoutingMachine;
