
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import L from 'leaflet';
import LocationMarker from './map-components/LocationMarker';
import DepotMarker from './map-components/DepotMarker';
import RoutingMachine from './map-components/RoutingMachine';

// Ensure leaflet icons work
// @ts-ignore - L.Icon.Default exists
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface LocationInfo {
  id: string;
  name: string;
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  address?: string;
}

interface WaypointInfo {
  name: string;
  coords: [number, number];
}

// Custom component to set view based on location changes
const SetViewOnChange = ({ center, allCoordinates, onCenterChange }: {
  center: [number, number];
  allCoordinates: [number, number][];
  onCenterChange?: (center: [number, number]) => void;
}) => {
  const mapRef = useRef<L.Map | null>(null);
  
  // Set map reference
  const setMap = (map: L.Map | null) => {
    if (map) {
      mapRef.current = map;
      if (onCenterChange) {
        onCenterChange(center);
      }
    }
  };
  
  // Get map reference
  useEffect(() => {
    if (!mapRef.current) {
      const map = L.DomUtil.get('map') as HTMLElement;
      if (map && map._leaflet_id) {
        // @ts-ignore - _leaflet_id exists on the HTMLElement
        setMap(L.Map.getMap(map._leaflet_id));
      }
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

interface RouteMapProps {
  locations: LocationInfo[];
  startLocation?: WaypointInfo;
  endLocation?: WaypointInfo;
  waypoints?: WaypointInfo[];
  showRouting?: boolean;
  height?: string;
  width?: string;
  forceRouteUpdate?: boolean;
  onRouteCalculated?: (routeInfo: {
    distance: number;
    duration: number;
  }) => void;
}

const RouteMap: React.FC<RouteMapProps> = ({
  locations,
  startLocation,
  endLocation,
  waypoints = [],
  showRouting = false,
  height = '500px',
  width = '100%',
  forceRouteUpdate = false,
  onRouteCalculated
}) => {
  const [isUserInteracting, setIsUserInteracting] = useState(false);
  const [mapId, setMapId] = useState<string>(`map-${Date.now()}`);
  
  // Default map center (Cape Town, South Africa)
  const defaultCenter: [number, number] = [-33.9249, 18.4241];
  const [mapCenter, setMapCenter] = useState<[number, number]>(defaultCenter);
  
  // Extract valid coordinates for all locations, start and end points
  const validLocations = locations.filter(loc => 
    loc.latitude !== null && loc.latitude !== undefined && 
    loc.longitude !== null && loc.longitude !== undefined
  );
  
  // Generate coordinates array for all markers
  const allCoordinates: [number, number][] = [
    // Add start location
    ...(startLocation?.coords ? [startLocation.coords] : []),
    // Add waypoints
    ...(waypoints?.map(wp => wp.coords) || []),
    // Add end location
    ...(endLocation?.coords ? [endLocation.coords] : [])
  ];
  
  // Create waypoints for routing in the format expected by Leaflet Routing Machine
  const routingWaypoints = allCoordinates.map(coord => ({ lat: coord[0], lng: coord[1] }));
  
  // Calculate a better center point based on all coordinates
  useEffect(() => {
    if (allCoordinates.length > 0) {
      // Calculate the average of all coordinates
      const sumLat = allCoordinates.reduce((sum, coord) => sum + coord[0], 0);
      const sumLng = allCoordinates.reduce((sum, coord) => sum + coord[1], 0);
      
      const avgLat = sumLat / allCoordinates.length;
      const avgLng = sumLng / allCoordinates.length;
      
      setMapCenter([avgLat, avgLng]);
    }
  }, [allCoordinates]);
  
  // Handle route calculation
  const handleRouteFound = (route: { distance: number; duration: number; coordinates: [number, number][] }) => {
    if (onRouteCalculated) {
      onRouteCalculated({
        distance: route.distance,
        duration: route.duration
      });
    }
  };
  
  return (
    <div style={{ height, width }}>
      <MapContainer
        id={mapId}
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
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <ZoomControl position="bottomright" />
        
        <SetViewOnChange center={mapCenter} allCoordinates={allCoordinates} />
        
        {/* Render routing if requested and we have at least 2 points */}
        {showRouting && routingWaypoints.length >= 2 && (
          <RoutingMachine 
            waypoints={routingWaypoints} 
            forceRouteUpdate={forceRouteUpdate}
            onRouteFound={handleRouteFound}
          />
        )}
        
        {/* Render start location */}
        {startLocation?.coords && (
          <DepotMarker
            position={startLocation.coords}
            name={startLocation.name}
            isStart={true}
          />
        )}
        
        {/* Render waypoints */}
        {waypoints?.map((waypoint, idx) => (
          <LocationMarker
            key={`waypoint-${idx}`}
            position={waypoint.coords}
            name={waypoint.name}
            index={idx + 1}
          />
        ))}
        
        {/* Render end location */}
        {endLocation?.coords && (
          <DepotMarker
            position={endLocation.coords}
            name={endLocation.name}
            isEnd={true}
          />
        )}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
