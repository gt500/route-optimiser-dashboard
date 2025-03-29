
import React, { useState, useEffect, useCallback } from 'react';
import { MapContainer, TileLayer, ZoomControl, AttributionControl } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';

// Import refactored components
import { SetViewOnChange } from './map-components/SetViewOnChange';
import { RoutingMachine } from './map-components/RoutingMachine';
import { LocationMarker } from './map-components/LocationMarker';
import { DepotMarker } from './map-components/DepotMarker';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface RouteMapProps {
  height?: string;
  width?: string;
  locations?: Array<{
    id: string | number;
    name: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    address: string;
    sequence?: number;
  }>;
  routes?: Array<{
    id: string;
    name: string;
    points: Array<[number, number]>;
  }>;
  selectedRouteId?: string;
  isEditable?: boolean;
  onLocationClick?: (locationId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  depot?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    name: string;
  } | null;
  showRouting?: boolean;
  startLocation?: {
    name: string;
    coords: [number, number];
  };
  endLocation?: {
    name: string;
    coords: [number, number];
  };
  waypoints?: Array<{
    name: string;
    coords: [number, number];
  }>;
  forceRouteUpdate?: boolean;
  onRouteDataUpdate?: (distance: number, duration: number) => void;
}

// MapInitializer component to handle map setup
const MapInitializer: React.FC<{
  center: [number, number];
  allCoordinates: Array<[number, number]>;
}> = ({ center, allCoordinates }) => {
  const mapRef = React.useRef<L.Map | null>(null);
  
  const setMapRef = useCallback((map: L.Map) => {
    if (map) {
      mapRef.current = map;
    }
  }, []);
  
  useEffect(() => {
    const currentMap = mapRef.current;
    if (!currentMap) return;
    
    if (allCoordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(allCoordinates.map(coord => [coord[0], coord[1]]));
        // Add padding to bounds to prevent markers from being at the edge
        currentMap.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } catch(err) {
        console.error("Error fitting bounds:", err);
        // Fallback to center view if bounds calculation fails
        currentMap.setView(center, 11);
      }
    } else {
      // Default view if no coordinates
      currentMap.setView(center, 11);
    }
    
    // Disable handlers that might interfere with zoom operation
    currentMap._handlers.forEach(function(handler: any) {
      if (handler._zoomAnimated) {
        handler._zoomAnimated = false;
      }
    });
    
    // Prevent automatic zoom resets
    const originalFitBounds = currentMap.fitBounds;
    currentMap.fitBounds = function(...args: any[]) {
      if (currentMap._loaded && !currentMap._lastInteraction) {
        return originalFitBounds.apply(this, args);
      }
      return currentMap;
    };
  }, [center, allCoordinates]);
  
  return null;
};

const RouteMap: React.FC<RouteMapProps> = ({
  height = '600px',
  width = '100%',
  locations = [],
  routes = [],
  selectedRouteId,
  isEditable = false,
  onLocationClick,
  onMapClick,
  depot = null,
  showRouting = false,
  startLocation,
  endLocation,
  waypoints = [],
  forceRouteUpdate = false,
  onRouteDataUpdate
}) => {
  // Default center based on South Africa
  const defaultCenter: [number, number] = [-30.5595, 22.9375]; // Center of South Africa
  
  // Calculate center based on available data
  const mapCenter: [number, number] = locations.length > 0 ? 
    [locations[0].latitude || locations[0].lat || defaultCenter[0], locations[0].longitude || locations[0].long || defaultCenter[1]] :
    defaultCenter;
  
  // Collect all coordinates for bounds
  const allCoordinates: Array<[number, number]> = [];
  
  // Add location coordinates
  if (locations && locations.length > 0) {
    locations.forEach(loc => {
      if ((loc.latitude || loc.lat) && (loc.longitude || loc.long)) {
        allCoordinates.push([loc.latitude || loc.lat || 0, loc.longitude || loc.long || 0]);
      }
    });
  }
  
  // Get selected route
  const selectedRoute = routes.find(route => route.id === selectedRouteId);
  const routeWaypoints = selectedRoute ? selectedRoute.points : [];
  
  // Handle routing waypoints
  let routingWaypoints: Array<[number, number]> = routeWaypoints;

  // If explicit routing is requested, use provided waypoints
  if (showRouting) {
    routingWaypoints = [];
    
    if (startLocation) {
      routingWaypoints.push(startLocation.coords);
    }
    
    waypoints.forEach(wp => {
      routingWaypoints.push(wp.coords);
    });
    
    if (endLocation) {
      routingWaypoints.push(endLocation.coords);
    }
  }
  
  // Add sequence numbers to locations for display order
  const locationsWithSequence = locations.map((loc, index) => ({
    ...loc,
    sequence: loc.sequence !== undefined ? loc.sequence : index
  }));

  // User interaction tracking
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  
  // Unique ID for the map to prevent remnants
  const mapId = React.useId();
  
  // Handle route data updates
  const handleRouteFound = useCallback((distance: number, duration: number) => {
    console.log("Route found with distance:", distance, "km and duration:", duration, "min");
    if (onRouteDataUpdate) {
      onRouteDataUpdate(distance, duration);
    }
  }, [onRouteDataUpdate]);
  
  // Cleanup effect for when component unmounts
  useEffect(() => {
    return () => {
      // Clean up Leaflet routing machine instances when component unmounts
      document.querySelectorAll('.leaflet-routing-container').forEach(el => {
        el.remove();
      });
      
      // Clean up any leaflet layers that might be lingering
      const mapContainers = document.querySelectorAll('.leaflet-container');
      mapContainers.forEach(container => {
        // Force remove any map instances
        const mapInstance = (L as any).DomUtil.getLeafletMap?.(container);
        if (mapInstance) {
          mapInstance.remove();
        }
        
        // Clean up DOM
        container.innerHTML = '';
      });
      
      // Clean up global Leaflet remnants
      if ((window as any)._leaflet_map_instances) {
        Object.keys((window as any)._leaflet_map_instances).forEach(key => {
          delete (window as any)._leaflet_map_instances[key];
        });
      }
    };
  }, []);
  
  return (
    <div style={{ height, width }}>
      <MapContainer 
        style={{ height: '100%', width: '100%' }}
        zoom={11}
        center={mapCenter}
        zoomControl={false}
        whenReady={(mapInstance) => {
          // Set up user interaction tracking
          mapInstance.target.on('zoomstart', () => setIsUserInteracting(true));
          mapInstance.target.on('zoomend', () => {
            setTimeout(() => setIsUserInteracting(false), 200);
          });
          
          // Capture all user interactions to prevent zoom resets
          mapInstance.target.on('dragend', () => {
            mapInstance.target._lastInteraction = Date.now();
          });
          mapInstance.target.on('zoomend', () => {
            mapInstance.target._lastInteraction = Date.now();
          });
        }}
        key={mapId}
      >
        <ZoomControl position="topright" />
        <SetViewOnChange coordinates={allCoordinates} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        
        {/* Position attribution at bottom right and only show one instance */}
        <AttributionControl position="bottomright" prefix={false} />
        
        {/* Always show routing if waypoints are available */}
        {routingWaypoints.length >= 2 && (
          <RoutingMachine 
            waypoints={routingWaypoints}
            color="#6366F1"
            fitBounds={false} // Prevent RoutingMachine from resetting the view bounds
            forceUpdate={forceRouteUpdate} // Force route update after load confirmation
            onRouteFound={handleRouteFound}
          />
        )}
        
        {/* Add location markers with sequence numbers */}
        {locationsWithSequence.map(location => (
          <LocationMarker 
            key={location.id.toString()}
            location={location}
            onLocationClick={onLocationClick}
          />
        ))}
        
        {/* Add depot marker if provided */}
        {depot && (
          <DepotMarker depot={depot} />
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
