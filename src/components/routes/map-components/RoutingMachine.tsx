
import React, { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet-routing-machine';

interface RoutingMachineProps {
  waypoints: Array<[number, number]>;
  color?: string;
  fitBounds?: boolean;
  forceUpdate?: boolean;
}

export const RoutingMachine: React.FC<RoutingMachineProps> = ({ 
  waypoints, 
  color = '#6366F1',
  fitBounds = true,
  forceUpdate = false
}) => {
  const map = useMap();
  const routingControlRef = useRef<L.Routing.Control | null>(null);
  
  // Prevent constant zooming by using a ref to track initialization
  const isInitializedRef = useRef(false);

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;

    // Remove previous routing control if it exists
    if (routingControlRef.current) {
      try {
        map.removeControl(routingControlRef.current);
      } catch (err) {
        console.error("Error removing routing control:", err);
      }
      routingControlRef.current = null;
    }

    try {
      // Override the _zoomToRoute function to prevent automatic zooming
      const originalZoomToRoute = L.Routing.Plan.prototype._zoomToRoute;
      L.Routing.Plan.prototype._zoomToRoute = function(...args: any[]) {
        if (!isInitializedRef.current) {
          originalZoomToRoute.apply(this, args);
          isInitializedRef.current = true;
        }
      };

      // Create routing control with real-time traffic consideration
      const routingControl = L.Routing.control({
        waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
        routeWhileDragging: false,
        showAlternatives: true, // Show alternative routes
        addWaypoints: false, // Prevent adding new waypoints by clicking
        fitSelectedRoutes: fitBounds && !isInitializedRef.current, // Only fit bounds once
        lineOptions: {
          styles: [{ color: color, weight: 4, opacity: 0.8 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        createMarker: function() { return null; }, // Disable default markers
        useZoomParameter: false, // Disable automatic zoom changes
        autoRoute: true, // Calculate routes automatically
        useHints: false, // Don't use routing hints (can cause issues)
        show: false, // Don't show the routing control panel
        // Use OSRM with traffic consideration
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving', // Use car profile
          suppressDemoServerWarning: true,
          timeout: 30 * 1000, // 30 second timeout
          geometryOnly: false,
          // Include traffic patterns based on time of day
          urlParameters: {
            alternatives: 3,
            steps: true,
            annotations: true,
            geometries: 'polyline',
            overview: 'full',
            hints: ''
          }
        })
      }).addTo(map);

      // Force routes to be visible even after load confirmation
      if (forceUpdate) {
        isInitializedRef.current = false;
      }

      // Disable the fitSelectedRoutes feature after initial setup
      routingControl.options.fitSelectedRoutes = false;

      routingControlRef.current = routingControl;
      
      // Preserve user's zoom level after routing is added
      const currentZoom = map.getZoom();
      const currentCenter = map.getCenter();
      
      // Listen for the routesfound event
      routingControl.on('routesfound', (e: any) => {
        console.log('Routes found with traffic data:', e.routes);
        
        // Get the fastest route (usually the first one)
        if (e.routes && e.routes.length > 0) {
          // Calculate the traffic factor based on actual vs expected time
          const route = e.routes[0];
          const trafficFactor = route.summary.totalTime / route.summary.totalDistance;
          console.log(`Traffic factor: ${trafficFactor}`);
        }
        
        // Short timeout to let the routes render before resetting the view if needed
        setTimeout(() => {
          if (!isInitializedRef.current) {
            isInitializedRef.current = true;
          } else {
            // Restore the user's view if already initialized
            map.setView(currentCenter, currentZoom);
          }
        }, 100);
      });
    } catch (err) {
      console.error("Error creating routing control:", err);
    }

    return () => {
      if (routingControlRef.current) {
        try {
          map.removeControl(routingControlRef.current);
          
          // Clean up any remaining routing elements
          document.querySelectorAll('.leaflet-routing-container').forEach(el => {
            el.remove();
          });
        } catch (err) {
          console.error("Error cleaning up routing control:", err);
        }
        routingControlRef.current = null;
      }
    };
  }, [waypoints, map, color, fitBounds, forceUpdate]); // Added forceUpdate to dependencies

  return null;
};
