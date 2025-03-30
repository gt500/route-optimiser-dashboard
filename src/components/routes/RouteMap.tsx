import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import SetViewOnChange from './map-components/SetViewOnChange';
import LocationMarker from './map-components/LocationMarker';
import DepotMarker from './map-components/DepotMarker';
import RoutingMachine from './map-components/RoutingMachine';

// Make sure the marker images are available
import '../../../node_modules/leaflet/dist/images/marker-icon.png';
import '../../../node_modules/leaflet/dist/images/marker-shadow.png';

// Define the types for the component props
interface LocationPoint {
  id: string;
  name: string;
  latitude?: number;
  longitude?: number;
  address?: string;
}

interface NamedCoords {
  name: string;
  coords: [number, number];
}

interface RouteMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  showRouting?: boolean;
  routeColor?: string;
  locations?: LocationPoint[];
  waypoints?: NamedCoords[];
  startLocation?: NamedCoords;
  endLocation?: NamedCoords;
  forceRouteUpdate?: boolean;
  trafficConditions?: 'light' | 'moderate' | 'heavy';
  showAlternateRoutes?: boolean;
  onRouteDataUpdate?: (distance: number, duration: number, coordinates?: [number, number][]) => void;
}

const RouteMap: React.FC<RouteMapProps> = ({
  center = [-33.918861, 18.423300], // Cape Town default
  zoom = 11,
  height = '400px',
  showRouting = false,
  routeColor = '#3b82f6',
  locations = [],
  waypoints = [],
  startLocation,
  endLocation,
  forceRouteUpdate = false,
  trafficConditions = 'moderate',
  showAlternateRoutes = false,
  onRouteDataUpdate,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [allWaypoints, setAllWaypoints] = useState<L.LatLng[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);

  // Calculate center based on all markers if not provided
  const calculateCenter = () => {
    if (locations.length === 0 && !startLocation && !endLocation && waypoints.length === 0) {
      return center;
    }

    const points: [number, number][] = [];

    if (startLocation) {
      points.push(startLocation.coords);
    }

    if (endLocation) {
      points.push(endLocation.coords);
    }

    waypoints.forEach((wp) => {
      points.push(wp.coords);
    });

    locations.forEach((loc) => {
      if (loc.latitude && loc.longitude) {
        points.push([loc.latitude, loc.longitude]);
      }
    });

    if (points.length === 0) {
      return center;
    }

    // Filter out any invalid coordinates (NaN values or zeros)
    const validPoints = points.filter(point => 
      !isNaN(point[0]) && !isNaN(point[1]) && 
      point[0] !== 0 && point[1] !== 0
    );
    
    if (validPoints.length === 0) {
      return center;
    }

    // Calculate the center of all points
    const lat = validPoints.reduce((sum, point) => sum + point[0], 0) / validPoints.length;
    const lng = validPoints.reduce((sum, point) => sum + point[1], 0) / validPoints.length;
    return [lat, lng] as [number, number];
  };

  useEffect(() => {
    setMapCenter(calculateCenter());
  }, [locations, startLocation, endLocation, waypoints]);

  useEffect(() => {
    if (mapRef.current && showRouting) {
      // Ensure the map is fully loaded
      if (!mapRef.current._leaflet_id) {
        return;
      }

      setMapReady(true);
    }
  }, [mapRef.current]);

  useEffect(() => {
    if (!mapReady || !showRouting || !mapRef.current) return;

    const routeWaypoints: L.LatLng[] = [];

    // Add start location
    if (startLocation) {
      routeWaypoints.push(L.latLng(startLocation.coords[0], startLocation.coords[1]));
    }

    // Add intermediate waypoints
    if (waypoints && waypoints.length > 0) {
      waypoints.forEach((wp) => {
        if (!isNaN(wp.coords[0]) && !isNaN(wp.coords[1]) && 
            wp.coords[0] !== 0 && wp.coords[1] !== 0) {
          routeWaypoints.push(L.latLng(wp.coords[0], wp.coords[1]));
        }
      });
    }

    // Add end location
    if (endLocation) {
      routeWaypoints.push(L.latLng(endLocation.coords[0], endLocation.coords[1]));
    }

    // Update waypoints state
    setAllWaypoints(routeWaypoints);
  }, [startLocation, endLocation, waypoints, mapReady, showRouting, forceRouteUpdate]);

  const handleMapInit = (mapInstance: L.Map) => {
    mapRef.current = mapInstance;
  };

  const handleRouteFound = (route: { distance: number; duration: number; coordinates: [number, number][] }) => {
    if (onRouteDataUpdate) {
      onRouteDataUpdate(route.distance, route.duration, route.coordinates);
    }
  };

  // Extract valid coordinates from locations for SetViewOnChange
  const allCoordinates = React.useMemo(() => {
    const coords: [number, number][] = [];
    
    if (startLocation) {
      coords.push(startLocation.coords);
    }
    
    waypoints.forEach(wp => {
      coords.push(wp.coords);
    });
    
    if (endLocation) {
      coords.push(endLocation.coords);
    }
    
    locations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        coords.push([loc.latitude, loc.longitude]);
      }
    });
    
    return coords;
  }, [startLocation, endLocation, waypoints, locations]);

  // Map traffic conditions to routing options
  const getTrafficAvoidanceOption = () => {
    switch (trafficConditions) {
      case 'light': return false; // No need to avoid traffic
      case 'heavy': return true;  // Always avoid traffic
      default: return true;       // Moderate - safer to avoid
    }
  };

  return (
    <MapContainer
      ref={handleMapInit}
      style={{ height, width: '100%' }}
      className="leaflet-container"
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <SetViewOnChange 
        center={mapCenter} 
        coordinates={allCoordinates}
        zoom={zoom}
      />

      {mapReady && showRouting && allWaypoints.length >= 2 && (
        <RoutingMachine
          waypoints={allWaypoints}
          forceRouteUpdate={forceRouteUpdate}
          onRouteFound={handleRouteFound}
          routeOptions={{
            avoidTraffic: getTrafficAvoidanceOption(),
            alternateRoutes: showAlternateRoutes
          }}
        />
      )}

      {startLocation && (
        <DepotMarker
          name={startLocation.name}
          position={startLocation.coords}
          isStart={true}
        />
      )}

      {endLocation && (
        <DepotMarker
          name={endLocation.name}
          position={endLocation.coords}
          isEnd={true}
        />
      )}

      {waypoints.map((wp, index) => (
        <LocationMarker
          key={`waypoint-${wp.name}-${index}`}
          id={`waypoint-${index}`}
          name={wp.name}
          position={wp.coords}
          index={index + 1}
          stopNumber={index + 1} // Sequential stop number for delivery order
        />
      ))}

      {locations.map((loc, index) => {
        if (!loc.latitude || !loc.longitude) return null;
        return (
          <LocationMarker
            key={`location-${loc.id}-${index}`}
            id={loc.id}
            name={loc.name}
            position={[loc.latitude, loc.longitude]}
            address={loc.address}
            stopNumber={index + 1} // Sequential stop number for delivery order
          />
        );
      })}
    </MapContainer>
  );
};

export default RouteMap;
