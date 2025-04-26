import React, { useRef, useMemo } from 'react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import SetViewOnChange from './map-components/SetViewOnChange';
import RoutingMachine from './map-components/RoutingMachine';
import TrafficOverlay from './map-components/TrafficOverlay';
import RouteMarkers from './map-components/RouteMarkers';
import { useMapState } from '@/hooks/routes/useMapState';
import { toast } from 'sonner';
import { LocationPoint, NamedCoords } from '@/types/location';

// Helper function to analyze traffic from route coordinates and segment durations
const analyzeTrafficFromCoordinates = (
  coordinates: [number, number][], 
  segmentDurations?: number[]
) => {
  if (!coordinates || coordinates.length < 2 || !segmentDurations || segmentDurations.length === 0) {
    return [];
  }
  
  // Create segments with traffic indicators
  const segments = [];
  for (let i = 0; i < coordinates.length - 1; i++) {
    const start = coordinates[i];
    const end = coordinates[i + 1];
    
    // Traffic density based on duration of segment relative to distance
    // This is a simplified model - in reality would need more complex analysis
    const segmentDuration = segmentDurations[i] || 0;
    const trafficDensity = segmentDuration > 60 ? 'heavy' : 
                          segmentDuration > 30 ? 'moderate' : 'light';
    
    segments.push({
      coordinates: [start, end],
      trafficDensity
    });
  }
  
  return segments;
};

interface RouteMapProps {
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
  showTrafficOverlay?: boolean;
  onRouteDataUpdate?: (
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy', 
    coordinates?: [number, number][],
    waypointData?: { distance: number, duration: number }[]
  ) => void;
  country?: string;
  region?: string;
  zoom?: number; // Add zoom property to support DailyReports.tsx
}

const RouteMap: React.FC<RouteMapProps> = ({
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
  showTrafficOverlay = true,
  onRouteDataUpdate,
  country,
  region,
  zoom
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const {
    mapReady,
    setMapReady,
    mapCenter,
    mapZoom,
    routeInitialized,
    setRouteInitialized,
    routeCoordinates,
    setRouteCoordinates
  } = useMapState(locations, startLocation, endLocation, waypoints, country, region);

  const [trafficSegments, setTrafficSegments] = React.useState([]);

  const handleMapInit = (mapInstance: L.Map) => {
    mapRef.current = mapInstance;
  };

  const handleRouteFound = (route: { 
    distance: number; 
    duration: number; 
    coordinates: [number, number][];
    trafficDensity?: 'light' | 'moderate' | 'heavy';
    waypoints?: { distance: number, duration: number }[];
    segmentDurations?: number[];
  }) => {
    setRouteCoordinates(route.coordinates);
    
    if (route.coordinates.length > 0) {
      const segments = analyzeTrafficFromCoordinates(route.coordinates, route.segmentDurations);
      setTrafficSegments(segments);
    }
    
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

  const allCoordinates = useMemo(() => {
    const coords: [number, number][] = [];
    
    if (startLocation) coords.push(startLocation.coords);
    waypoints.forEach(wp => coords.push(wp.coords));
    if (endLocation) coords.push(endLocation.coords);
    locations.forEach(loc => {
      if (loc.latitude && loc.longitude) {
        coords.push([loc.latitude, loc.longitude]);
      }
    });
    
    return coords;
  }, [startLocation, endLocation, waypoints, locations]);

  return (
    <MapContainer
      ref={handleMapInit}
      style={{ height, width: '100%' }}
      className="leaflet-container"
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

      <SetViewOnChange 
        center={mapCenter} 
        coordinates={allCoordinates}
        zoom={mapZoom}
      />

      {mapReady && showRouting && allCoordinates.length >= 2 && (
        <RoutingMachine
          waypoints={allCoordinates.map(coord => L.latLng(coord[0], coord[1]))}
          forceRouteUpdate={forceRouteUpdate}
          onRouteFound={handleRouteFound}
          routeOptions={{
            avoidTraffic: useRealTimeTraffic,
            alternateRoutes: showAlternateRoutes,
            useRealTimeData: useRealTimeTraffic,
            routeColor,
            routeWeight,
            includeSegmentDurations: true
          }}
        />
      )}
      
      {showTrafficOverlay && trafficSegments.length > 0 && (
        <TrafficOverlay 
          trafficSegments={trafficSegments}
          visible={showTrafficOverlay}
        />
      )}

      <RouteMarkers
        startLocation={startLocation}
        endLocation={endLocation}
        waypoints={waypoints}
        locations={locations}
      />
    </MapContainer>
  );
};

export default RouteMap;
