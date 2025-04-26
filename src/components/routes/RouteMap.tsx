import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import SetViewOnChange from './map-components/SetViewOnChange';
import LocationMarker from './map-components/LocationMarker';
import DepotMarker from './map-components/DepotMarker';
import RoutingMachine from './map-components/RoutingMachine';
import { toast } from 'sonner';
import { getRegionCoordinates } from '@/utils/route/regionUtils';

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

interface WaypointData {
  distance: number;
  duration: number;
}

interface RouteMapProps {
  center?: [number, number];
  zoom?: number;
  height?: string;
  showRouting?: boolean;
  routeColor?: string;
  routeWeight?: number;
  locations?: LocationPoint[];
  waypoints?: NamedCoords[];
  startLocation?: NamedCoords;
  endLocation?: NamedCoords;
  forceRouteUpdate?: boolean;
  trafficConditions?: 'light' | 'moderate' | 'heavy';
  showAlternateRoutes?: boolean;
  useRealTimeTraffic?: boolean;
  onRouteDataUpdate?: (
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy', 
    coordinates?: [number, number][],
    waypointData?: WaypointData[]
  ) => void;
  country?: string;
  region?: string;
}

const RouteMap: React.FC<RouteMapProps> = ({
  center = [-33.918861, 18.423300], // Cape Town default
  zoom = 11,
  height = '400px',
  showRouting = false,
  routeColor = '#3b82f6',
  routeWeight = 6,
  locations = [],
  waypoints = [],
  startLocation,
  endLocation,
  forceRouteUpdate = false,
  trafficConditions = 'moderate',
  showAlternateRoutes = false,
  useRealTimeTraffic = true,
  onRouteDataUpdate,
  country,
  region,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [allWaypoints, setAllWaypoints] = useState<L.LatLng[]>([]);
  const [mapCenter, setMapCenter] = useState<[number, number]>(center);
  const [routeInitialized, setRouteInitialized] = useState(false);

  const calculateCenter = () => {
    if (locations.length === 0 && !startLocation && !endLocation && waypoints.length === 0) {
      // If no locations, use region-based coordinates
      return getRegionCoordinates(country, region).center;
    }

    const points: [number, number][] = [];

    if (startLocation) {
      points.push(startLocation.coords);
    }

    if (endLocation) {
      points.push(endLocation.coords);
    }

    waypoints.forEach((wp) => {
      if (!isNaN(wp.coords[0]) && !isNaN(wp.coords[1]) && 
          wp.coords[0] !== 0 && wp.coords[1] !== 0) {
        points.push(L.latLng(wp.coords[0], wp.coords[1]));
      }
    });

    locations.forEach((loc) => {
      if (loc.latitude && loc.longitude) {
        points.push([loc.latitude, loc.longitude]);
      }
    });

    if (points.length === 0) {
      return center;
    }

    const validPoints = points.filter(point => 
      !isNaN(point[0]) && !isNaN(point[1]) && 
      point[0] !== 0 && point[1] !== 0
    );
    
    if (validPoints.length === 0) {
      return center;
    }

    const lat = validPoints.reduce((sum, point) => sum + point[0], 0) / validPoints.length;
    const lng = validPoints.reduce((sum, point) => sum + point[1], 0) / validPoints.length;
    return [lat, lng] as [number, number];
  };

  useEffect(() => {
    setMapCenter(calculateCenter());
  }, [locations, startLocation, endLocation, waypoints, country, region]);

  useEffect(() => {
    if (mapRef.current && showRouting) {
      if (!mapRef.current._leaflet_id) {
        return;
      }

      setMapReady(true);
    }
  }, [mapRef.current]);

  useEffect(() => {
    if (!mapReady || !showRouting || !mapRef.current) return;

    const routeWaypoints: L.LatLng[] = [];

    if (startLocation) {
      routeWaypoints.push(L.latLng(startLocation.coords[0], startLocation.coords[1]));
    }

    if (waypoints && waypoints.length > 0) {
      waypoints.forEach((wp) => {
        if (!isNaN(wp.coords[0]) && !isNaN(wp.coords[1]) && 
            wp.coords[0] !== 0 && wp.coords[1] !== 0) {
          routeWaypoints.push(L.latLng(wp.coords[0], wp.coords[1]));
        }
      });
    }

    if (endLocation) {
      routeWaypoints.push(L.latLng(endLocation.coords[0], endLocation.coords[1]));
    }

    setAllWaypoints(routeWaypoints);
    
    if (routeWaypoints.length >= 2 && !routeInitialized) {
      setRouteInitialized(true);
      toast.info("Calculating optimal route with real-time traffic data...");
    }
  }, [startLocation, endLocation, waypoints, mapReady, showRouting, forceRouteUpdate]);

  const handleMapInit = (mapInstance: L.Map) => {
    mapRef.current = mapInstance;
  };

  const handleRouteFound = (route: { 
    distance: number; 
    duration: number; 
    coordinates: [number, number][];
    trafficDensity?: 'light' | 'moderate' | 'heavy';
    waypoints?: WaypointData[];
  }) => {
    if (onRouteDataUpdate) {
      onRouteDataUpdate(
        route.distance, 
        route.duration, 
        route.trafficDensity || trafficConditions,
        route.coordinates,
        route.waypoints
      );
    }
  };

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

  const getRouteAppearance = () => {
    let color = routeColor;
    let weight = routeWeight;
    
    if (trafficConditions === 'light') {
      color = '#22c55e';
    } else if (trafficConditions === 'moderate') {
      color = '#f59e0b';
    } else if (trafficConditions === 'heavy') {
      color = '#ef4444';
    }
    
    return { routeColor: color, routeWeight: weight };
  };

  const getTrafficAvoidanceOption = () => {
    if (useRealTimeTraffic) return true;
    
    switch (trafficConditions) {
      case 'light': return false;
      case 'heavy': return true;
      default: return true;
    }
  };

  const routeAppearance = getRouteAppearance();

  return (
    <MapContainer
      ref={handleMapInit}
      style={{ height, width: '100%' }}
      className="leaflet-container"
      zoom={region ? getRegionCoordinates(country, region).zoom : zoom}
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
            alternateRoutes: showAlternateRoutes,
            useRealTimeData: useRealTimeTraffic,
            routeColor: routeAppearance.routeColor,
            routeWeight: routeAppearance.routeWeight
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
          stopNumber={index + 1}
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
            stopNumber={index + 1}
          />
        );
      })}
    </MapContainer>
  );
};

export default RouteMap;
