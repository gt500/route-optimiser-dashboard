
import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin } from 'lucide-react';
import { MapContainer, TileLayer } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import MapSetup from './map-components/MapSetup';
import RouteRoutingMachine from './map-components/RouteRoutingMachine';
import TrafficIndicator from './map-components/TrafficIndicator';
import NoLocationsDisplay from './map-components/NoLocationsDisplay';

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
  
  // Calculate the map bounds to fit all waypoints
  const bounds = React.useMemo(() => {
    if (!L || waypoints.length < 1) return null;
    
    const latLngs = waypoints.map(point => [point.lat, point.lng]);
    return L.latLngBounds(latLngs);
  }, [waypoints]);
  
  // Force update the routing component when route name or region changes
  React.useEffect(() => {
    if (routeName || region) {
      setForceUpdate(prev => prev + 1);
    }
  }, [routeName, region]);
  
  // Use first location coordinates as default center or fallback to Cape Town
  const defaultCenter: [number, number] = 
    locations[0] && locations[0].latitude && locations[0].longitude 
      ? [locations[0].latitude, locations[0].longitude]
      : [-33.93, 18.52];
  
  // Helper function to determine if we have enough valid locations to show a map
  const hasValidLocations = locations.length >= 2;

  return (
    <div className={`relative ${className}`} style={{ height }}>
      {hasValidLocations ? (
        <div className="h-full w-full relative overflow-hidden">
          <MapContainer
            key={`map-${defaultCenter[0]}-${defaultCenter[1]}`}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapSetup 
              bounds={bounds} 
              onMapReady={() => setMapReady(true)} 
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
