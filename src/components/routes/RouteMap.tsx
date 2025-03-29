
import React, { useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
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
  };
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
}

const RouteMap: React.FC<RouteMapProps> = ({
  height = '600px',
  width = '100%',
  locations = [],
  routes = [],
  selectedRouteId,
  isEditable = false,
  onLocationClick,
  onMapClick,
  depot = {
    latitude: -33.9258,
    longitude: 18.4232,
    name: 'Cape Town Depot'
  },
  showRouting = false,
  startLocation,
  endLocation,
  waypoints = []
}) => {
  // Default center if no locations or depot
  const defaultCenter: [number, number] = [-33.9258, 18.4232]; // Cape Town
  
  // Calculate center based on available data
  const [mapCenter] = useState<[number, number]>(
    depot ? [depot.latitude || depot.lat || defaultCenter[0], depot.longitude || depot.long || defaultCenter[1]] : defaultCenter
  );
  
  // Collect all coordinates for bounds
  const allCoordinates: Array<[number, number]> = [];
  
  // Add depot coordinates
  if (depot) {
    allCoordinates.push([depot.latitude || depot.lat || defaultCenter[0], depot.longitude || depot.long || defaultCenter[1]]);
  }
  
  // Add location coordinates
  if (locations && locations.length > 0) {
    locations.forEach(loc => {
      allCoordinates.push([loc.latitude || loc.lat || 0, loc.longitude || loc.long || 0]);
    });
  }
  
  // Get selected route
  const selectedRoute = routes.find(route => route.id === selectedRouteId);
  const routeWaypoints = selectedRoute ? selectedRoute.points : [];
  
  // Handle routing waypoints
  const routingWaypoints = showRouting ? [] : routeWaypoints;

  // If explicit routing is requested, use provided waypoints
  if (showRouting) {
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
  
  return (
    <div style={{ height, width }}>
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={mapCenter}
        zoom={11}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Add bounds controller */}
        {allCoordinates.length > 0 && (
          <SetViewOnChange coordinates={allCoordinates} />
        )}
        
        {/* Add routing if a route is selected or explicit routing is requested */}
        {(selectedRoute || (showRouting && routingWaypoints.length >= 2)) && (
          <RoutingMachine waypoints={routingWaypoints} />
        )}
        
        {/* Add depot marker */}
        {depot && <DepotMarker depot={depot} defaultCenter={defaultCenter} />}
        
        {/* Add location markers */}
        {locations.map(location => (
          <LocationMarker 
            key={location.id.toString()}
            location={location}
            onLocationClick={onLocationClick}
          />
        ))}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
