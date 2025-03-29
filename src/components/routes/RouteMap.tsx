
import React, { useState, useEffect } from 'react';
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

// MapInitializer component to handle map setup
const MapInitializer: React.FC<{
  center: [number, number];
  allCoordinates: Array<[number, number]>;
}> = ({ center, allCoordinates }) => {
  const map = useMap();
  
  useEffect(() => {
    if (allCoordinates.length > 0) {
      try {
        const bounds = L.latLngBounds(allCoordinates.map(coord => [coord[0], coord[1]]));
        // Add padding to bounds to prevent markers from being at the edge
        map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
      } catch(err) {
        console.error("Error fitting bounds:", err);
        // Fallback to center view if bounds calculation fails
        map.setView(center, 11);
      }
    } else {
      // Default view if no coordinates
      map.setView(center, 11);
    }
    
    // This helps prevent constant zooming issues
    return () => {
      map._handlers.forEach(function(handler) {
        if (handler._zoomAnimated) {
          handler._zoomAnimated = false;
        }
      });
    };
  }, [map, center, allCoordinates]);
  
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
  const mapCenter: [number, number] = depot ? 
    [depot.latitude || depot.lat || defaultCenter[0], depot.longitude || depot.long || defaultCenter[1]] : 
    defaultCenter;
  
  // Collect all coordinates for bounds
  const allCoordinates: Array<[number, number]> = [];
  
  // Add depot coordinates
  if (depot) {
    allCoordinates.push([depot.latitude || depot.lat || defaultCenter[0], depot.longitude || depot.long || defaultCenter[1]]);
  }
  
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
  
  // Add sequence numbers to locations for display order
  const locationsWithSequence = locations.map((loc, index) => ({
    ...loc,
    sequence: index
  }));
  
  return (
    <div style={{ height, width }}>
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        attributionControl={false}
      >
        <AttributionControl position="bottomright" />
        <ZoomControl position="topright" />
        <MapInitializer center={mapCenter} allCoordinates={allCoordinates} />
        
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Add routing if a route is selected or explicit routing is requested */}
        {(selectedRoute || (showRouting && routingWaypoints.length >= 2)) && (
          <RoutingMachine 
            waypoints={routingWaypoints}
            color="#6366F1"
            fitBounds={false} // Prevent RoutingMachine from resetting the view bounds
          />
        )}
        
        {/* Add depot marker */}
        {depot && <DepotMarker depot={depot} defaultCenter={defaultCenter} />}
        
        {/* Add location markers with sequence numbers */}
        {locationsWithSequence.map(location => (
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
