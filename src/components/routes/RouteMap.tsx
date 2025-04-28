
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import RouteMarkers from './map-components/RouteMarkers';
import SetViewOnChange from './map-components/SetViewOnChange';
import { useMapState } from '@/hooks/routes/useMapState';
import RoutingMachine from './map-components/RoutingMachine';
import TrafficOverlay from './map-components/TrafficOverlay';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface RouteMapProps {
  locations: Location[];
  className?: string;
  height?: string;
  onRouteDataUpdate?: (distance: number, duration: number, trafficConditions?: 'light' | 'moderate' | 'heavy') => void;
  showTraffic?: boolean;
  country?: string;
  region?: string;
}

const RouteMap: React.FC<RouteMapProps> = ({
  locations = [],
  className = '',
  height = '500px',
  onRouteDataUpdate,
  showTraffic = false,
  country,
  region,
}) => {
  // Use the custom hook for map state management
  const { mapCenter, zoom } = useMapState(locations, country, region);
  
  // Setup default map center for South Africa if no specific locations
  const defaultCenter: [number, number] = [-30.5595, 22.9375]; // Center of South Africa
  const center = (mapCenter[0] !== 0 && mapCenter[1] !== 0) ? mapCenter : defaultCenter;
  
  // Map component with memoization to prevent unnecessary re-renders
  const MapComponent = React.useMemo(() => (
    <MapContainer
      style={{ height, width: '100%' }}
      className={`z-0 ${className}`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {/* Only render routes and markers if we have locations */}
      {locations.length > 0 && (
        <>
          <RouteMarkers 
            locations={locations}
            waypoints={[]} 
            startLocation={undefined}
            endLocation={undefined}
          />
          <RoutingMachine 
            waypoints={locations.map(loc => ({ lat: loc.latitude, lng: loc.longitude }))} 
            onRouteFound={(route) => {
              onRouteDataUpdate && onRouteDataUpdate(
                route.distance, 
                route.duration, 
                route.trafficConditions
              );
            }}
          />
        </>
      )}
      
      {showTraffic && <TrafficOverlay trafficSegments={[]} />}
      
      {/* Update view when center or zoom changes */}
      <SetViewOnChange center={center} zoom={zoom} />
    </MapContainer>
  ), [locations, center, zoom, height, className, showTraffic, onRouteDataUpdate]);

  return MapComponent;
};

export default React.memo(RouteMap);
