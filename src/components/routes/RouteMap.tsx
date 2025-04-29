
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import MapSetup from './map-components/MapSetup';
import RouteRoutingMachine from './map-components/RouteRoutingMachine';
import RouteMarkers from './map-components/RouteMarkers';
import TrafficIndicator from './map-components/TrafficIndicator';
import NoLocationsDisplay from './map-components/NoLocationsDisplay';
import { useMapState } from '@/hooks/routes/useMapState';
import { NamedCoords, LeafletTileLayerProps } from '@/types/location';

interface RouteMapProps {
  locations: {
    id: string;
    name: string;
    latitude: number;
    longitude: number;
    address?: string;
  }[];
  className?: string;
  height?: string;
  showTraffic?: boolean;
  showRoadRoutes?: boolean;
  onRouteDataUpdate?: (
    distance: number, 
    duration: number,
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number; duration: number }[]
  ) => void;
  country?: string;
  region?: string;
  routeName?: string;
  showStopMetrics?: boolean;
}

const RouteMap: React.FC<RouteMapProps> = ({
  locations,
  className = '',
  height = '400px',
  showTraffic = false,
  showRoadRoutes = false,
  onRouteDataUpdate,
  country,
  region,
  routeName,
  showStopMetrics = false
}) => {
  const [mapReady, setMapReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  const { bounds, mapCenter, zoom } = useMapState(locations, country, region);
  
  // Convert locations to Leaflet waypoints
  const waypoints = React.useMemo(() => {
    if (!L) return [];
    
    return locations
      .filter(loc => 
        loc.latitude && 
        loc.longitude && 
        !isNaN(loc.latitude) && 
        !isNaN(loc.longitude)
      )
      .map(loc => L.latLng(loc.latitude, loc.longitude));
  }, [locations]);
  
  // Force update the routing component when route name or region changes
  React.useEffect(() => {
    if (routeName || region) {
      setForceUpdate(prev => prev + 1);
    }
  }, [routeName, region]);

  // Format locations for markers
  const formattedLocations = React.useMemo(() => {
    return locations.map(loc => ({
      id: loc.id,
      name: loc.name,
      latitude: loc.latitude,
      longitude: loc.longitude,
      address: loc.address
    }));
  }, [locations]);

  // Create waypoints for markers
  const waypointCoords = React.useMemo(() => {
    return locations.map(loc => ({
      name: loc.name,
      coords: [loc.latitude, loc.longitude] as [number, number]
    })) as NamedCoords[];
  }, [locations]);
  
  // Helper function to determine if we have enough valid locations to show a map
  const hasValidLocations = locations.length >= 1;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {hasValidLocations ? (
        <div className="h-full w-full relative overflow-hidden">
          {/* Fix: Remove center and zoom from MapContainer and let MapSetup handle it */}
          <MapContainer
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            {/* Using TileLayer with proper typing */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            <MapSetup 
              bounds={bounds} 
              center={mapCenter}
              zoom={zoom}
              onMapReady={() => setMapReady(true)} 
            />
            
            {/* Always show markers for locations */}
            <RouteMarkers
              locations={formattedLocations}
              waypoints={waypointCoords}
              showStopNumbers={true}
            />
            
            {mapReady && waypoints.length >= 2 && (
              <RouteRoutingMachine 
                waypoints={waypoints} 
                forceRouteUpdate={forceUpdate}
                onRouteFound={onRouteDataUpdate}
                showRoadRoutes={showRoadRoutes}
                routeName={routeName}
              />
            )}
          </MapContainer>
          
          {/* Traffic indicator */}
          {showTraffic && <TrafficIndicator />}
        </div>
      ) : (
        <NoLocationsDisplay />
      )}
    </div>
  );
};

export default RouteMap;
