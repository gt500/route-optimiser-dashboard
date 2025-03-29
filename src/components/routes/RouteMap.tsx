
import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import { SetViewOnChange } from './map-components/SetViewOnChange';
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
}) => {
  const routingMachineRef = useRef<any>(null);
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);

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

  const calculatedCenter = calculateCenter();

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

    const allWaypoints: L.LatLng[] = [];

    // Add start location
    if (startLocation) {
      allWaypoints.push(L.latLng(startLocation.coords[0], startLocation.coords[1]));
    }

    // Add intermediate waypoints
    if (waypoints && waypoints.length > 0) {
      waypoints.forEach((wp) => {
        allWaypoints.push(L.latLng(wp.coords[0], wp.coords[1]));
      });
    }

    // Add end location
    if (endLocation) {
      allWaypoints.push(L.latLng(endLocation.coords[0], endLocation.coords[1]));
    }

    // Update routing if we have at least 2 waypoints
    if (allWaypoints.length >= 2 && routingMachineRef.current) {
      routingMachineRef.current.setWaypoints(allWaypoints);
    }
  }, [startLocation, endLocation, waypoints, mapReady, showRouting, forceRouteUpdate]);

  const handleMapInit = (mapInstance: L.Map) => {
    mapRef.current = mapInstance;
  };

  return (
    <MapContainer
      center={calculatedCenter}
      zoom={zoom}
      style={{ height, width: '100%' }}
      whenReady={handleMapInit}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      {mapReady && showRouting && (
        <RoutingMachine
          waypoints={allWaypoints || []}
          forceRouteUpdate={forceRouteUpdate}
        />
      )}

      <SetViewOnChange center={calculatedCenter} />

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
