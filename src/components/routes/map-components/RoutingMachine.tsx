
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
}

const RoutingMachine: React.FC<RoutingMachineProps> = ({ 
  waypoints = [], 
  forceRouteUpdate, 
  onRouteFound 
}) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) {
      console.log("Not enough waypoints or map not ready:", waypoints);
      return;
    }
    
    console.log("Creating route with waypoints:", waypoints);
    
    let routingControl: any = null;
    
    const createRoute = () => {
      if (routingControl) {
        map.removeControl(routingControl);
      }
      
      try {
        // Ensure all waypoints are valid LatLng objects
        const validWaypoints = waypoints.filter(wp => 
          wp && wp.lat !== undefined && wp.lng !== undefined && 
          !isNaN(wp.lat) && !isNaN(wp.lng) && 
          wp.lat !== 0 && wp.lng !== 0
        );
        
        if (validWaypoints.length < 2) {
          console.log("Not enough valid waypoints to create route:", validWaypoints);
          return;
        }
        
        console.log("Creating route with valid waypoints:", validWaypoints);
        
        // Use the L.Routing global with proper road-following settings
        routingControl = L.Routing.control({
          waypoints: validWaypoints,
          router: L.Routing.osrm({
            serviceUrl: 'https://router.project-osrm.org/route/v1',
            profile: 'driving'
          }),
          lineOptions: {
            styles: [{ color: '#6366F1', weight: 4, opacity: 0.7 }],
            extendToWaypoints: true,
            missingRouteTolerance: 0
          },
          routeWhileDragging: false,
          addWaypoints: false,
          draggableWaypoints: false,
          fitSelectedRoutes: false,
          showAlternatives: false,
          show: false // Hide the instruction panel
        }).addTo(map);
        
        // Hide the routing control UI but show the route path
        routingControl.hide();
        
        // Extract route information when a route is found
        routingControl.on('routesfound', (e: any) => {
          const routes = e.routes;
          if (routes && routes.length > 0) {
            const route = routes[0];
            const totalDistance = route.summary.totalDistance / 1000; // convert to km
            const totalTime = route.summary.totalTime / 60; // convert to minutes
            
            console.log(`Route found: ${totalDistance.toFixed(2)} km, ${totalTime.toFixed(0)} minutes`);
            
            // Extract the coordinates from the route
            const coordinates: [number, number][] = route.coordinates.map((coord: any) => [
              coord.lat,
              coord.lng
            ]);
            
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
  }, [map, waypoints, forceRouteUpdate, onRouteFound]);
  
  return null;
};

export default RoutingMachine;
