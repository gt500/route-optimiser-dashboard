
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
  onRouteDataUpdate?: (distance: number, duration: number, coordinates: [number, number][]) => void;
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

    // Calculate the center of all points
    const lat = points.reduce((sum, point) => sum + point[0], 0) / points.length;
    const lng = points.reduce((sum, point) => sum + point[1], 0) / points.length;
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
        routeWaypoints.push(L.latLng(wp.coords[0], wp.coords[1]));
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

  return (
    <MapContainer
      ref={handleMapInit}
      center={mapCenter}
      zoom={zoom}
      style={{ height, width: '100%' }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
      />

      {mapReady && showRouting && allWaypoints.length >= 2 && (
        <RoutingMachine
          waypoints={allWaypoints}
          forceRouteUpdate={forceRouteUpdate}
          onRouteFound={handleRouteFound}
        />
      )}

      <SetViewOnChange center={mapCenter} />

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
          key={`waypoint-${index}`}
          id={`waypoint-${index}`}
          name={wp.name}
          position={wp.coords}
          index={index + 1}
        />
      ))}

      {locations.map((loc, index) => {
        if (!loc.latitude || !loc.longitude) return null;
        return (
          <LocationMarker
            key={loc.id || `loc-${index}`}
            id={loc.id}
            name={loc.name}
            position={[loc.latitude, loc.longitude]}
            address={loc.address}
          />
        );
      })}
    </MapContainer>
  );
};

export default RouteMap;
