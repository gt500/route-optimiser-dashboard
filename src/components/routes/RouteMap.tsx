
import React, { useEffect, useRef, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { MapPin, Truck } from 'lucide-react';
import { calculateCompleteRoute } from '@/utils/route/routeCalculation';
import { getTrafficColor, getCurrentTrafficCondition } from '@/utils/route/trafficUtils';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import RoutingMachine from './map-components/RoutingMachine';

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
  const mapRef = useRef<L.Map | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [forceUpdate, setForceUpdate] = useState(0);
  
  // Convert locations to Leaflet waypoints
  const waypoints = React.useMemo(() => {
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
    if (waypoints.length < 1) return null;
    
    const latLngs = waypoints.map(point => [point.lat, point.lng]);
    return L.latLngBounds(latLngs);
  }, [waypoints]);
  
  // Handle route data results
  const handleRouteFound = (routeData: {
    distance: number;
    duration: number;
    coordinates: [number, number][];
    waypoints?: { distance: number; duration: number }[];
    trafficConditions?: 'light' | 'moderate' | 'heavy';
  }) => {
    if (onRouteDataUpdate) {
      console.log("Route data found:", routeData);
      onRouteDataUpdate(
        routeData.distance, 
        routeData.duration, 
        routeData.trafficConditions || getCurrentTrafficCondition(),
        routeData.coordinates,
        routeData.waypoints
      );
    }
  };
  
  // Leaflet map setup
  const MapSetup = () => {
    const map = useMap();
    
    useEffect(() => {
      if (map) {
        mapRef.current = map;
        setMapReady(true);
        
        // Fit bounds to all waypoints if we have locations
        if (bounds && waypoints.length > 1) {
          map.fitBounds(bounds, { padding: [50, 50] });
        }
      }
    }, [map, bounds]);
    
    return null;
  };
  
  // Force update the routing component when route name or region changes
  useEffect(() => {
    if (routeName || region) {
      setForceUpdate(prev => prev + 1);
    }
  }, [routeName, region]);
  
  // Use first location coordinates as default center or fallback to Cape Town
  const defaultCenter: [number, number] = 
    locations[0] && locations[0].latitude && locations[0].longitude 
      ? [locations[0].latitude, locations[0].longitude]
      : [-33.93, 18.52];
  
  return (
    <div className={`relative ${className}`} style={{ height }}>
      {locations.length >= 2 ? (
        <div className="h-full w-full relative overflow-hidden">
          <MapContainer
            defaultCenter={defaultCenter}
            zoom={12}
            style={{ height: '100%', width: '100%' }}
            className="z-0"
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            <MapSetup />
            
            {mapReady && waypoints.length >= 2 && (
              <RoutingMachine 
                waypoints={waypoints} 
                forceRouteUpdate={forceUpdate}
                onRouteFound={handleRouteFound}
                routeOptions={{
                  showRoadRoutes: showRoadRoutes,
                  avoidTraffic: true,
                  routeColor: '#3b82f6',
                  routeWeight: 5,
                  alternateRoutes: false,
                  includeSegmentDurations: true
                }}
                routeName={routeName}
              />
            )}
          </MapContainer>
          
          {/* Traffic indicator */}
          {showTraffic && (
            <div className="absolute top-2 right-2 bg-white p-2 rounded-md shadow-md z-10">
              <div className="flex items-center gap-1 text-xs">
                <span className="font-medium">Traffic:</span>
                <div className={`${getTrafficColor(getCurrentTrafficCondition())} w-2 h-2 rounded-full`}></div>
                <span>{getCurrentTrafficCondition()}</span>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="absolute inset-0 bg-slate-100 flex items-center justify-center">
          <div className="text-center p-4">
            <MapPin className="h-12 w-12 mx-auto text-slate-400" />
            <p className="mt-2 text-slate-500">
              Add at least two locations to view the route
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
