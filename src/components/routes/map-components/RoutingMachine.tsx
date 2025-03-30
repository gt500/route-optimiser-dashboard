
import React, { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

interface RoutingMachineProps {
  waypoints?: L.LatLng[];
  forceRouteUpdate?: boolean;
  onRouteFound?: (route: { 
    distance: number; 
    duration: number; 
    coordinates: [number, number][]; 
  }) => void;
  routeOptions?: {
    avoidTraffic?: boolean;
    alternateRoutes?: boolean;
  };
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ 
  waypoints = [], 
  forceRouteUpdate, 
  onRouteFound,
  routeOptions = { avoidTraffic: true, alternateRoutes: false }
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
        
        // Configure options with real-time traffic preferences
        const routerOptions: L.Routing.RoutingControlOptions = {
          router: L.Routing.osrm({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving', // Use driving profile for road-based routing
            useHints: false, // Disable hints for more accurate real-time routing
            suppressDemoServerWarning: true,
            urlParameters: {
              // Optimize for traffic avoidance if enabled
              alternatives: routeOptions.alternateRoutes ? 'true' : 'false',
              steps: 'true',
              geometries: 'geojson',
              overview: 'full',
              annotations: 'true'
            }
          }),
          waypoints: validWaypoints,
          lineOptions: {
            styles: [{ color: '#6366F1', weight: 4, opacity: 0.7 }],
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
        
        // Extract route information when a route is found
        routingControl.on('routesfound', (e: L.Routing.RoutingResultEvent) => {
          const routes = e.routes;
          if (routes && routes.length > 0) {
            const route = routes[0];
            const totalDistance = route.summary.totalDistance / 1000; // convert to km
            const totalTime = route.summary.totalTime / 60; // convert to minutes
            
            console.log(`Route found: ${totalDistance.toFixed(2)} km, ${totalTime.toFixed(0)} minutes`);
            
            // Extract the coordinates from the route
            const coordinates = route.coordinates.map((coord) => [
              coord.lat,
              coord.lng
            ] as [number, number]);
            
            if (onRouteFound) {
              onRouteFound({
                distance: totalDistance,
                duration: totalTime,
                coordinates
              });
            }
          }
        });
      } catch (error) {
        console.error("Error creating routing control:", error);
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
