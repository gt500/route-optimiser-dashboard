
import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';
import RouteMarkers from './map-components/RouteMarkers';
import SetViewOnChange from './map-components/SetViewOnChange';
import { useMapState } from '@/hooks/routes/useMapState';
import RoutingMachine from './map-components/RoutingMachine';
import TrafficOverlay from './map-components/TrafficOverlay';
import { toast } from 'sonner';
import { calculateDistance } from '@/utils/route/distanceUtils';
import { AVG_SPEED_URBAN_KM_H } from '@/utils/route/constants';
import { calculateRoadDistances } from '@/utils/route/routeCalculation';

interface Location {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address?: string;
}

interface NamedCoords {
  name: string;
  coords: [number, number];
}

interface RouteMapProps {
  locations: Location[];
  className?: string;
  height?: string;
  onRouteDataUpdate?: (
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number, duration: number }[]
  ) => void;
  showTraffic?: boolean;
  country?: string;
  region?: string;
  showRoadRoutes?: boolean;
}

const RouteMap: React.FC<RouteMapProps> = ({
  locations = [],
  className = '',
  height = '500px',
  onRouteDataUpdate,
  showTraffic = false,
  country,
  region,
  showRoadRoutes = true, // Default to showing road routes
}) => {
  // Use the custom hook for map state management
  const { mapCenter, zoom } = useMapState(locations, country, region);
  const [trafficSegments, setTrafficSegments] = useState<any[]>([]);
  
  // Setup default map center for South Africa if no specific locations
  const defaultCenter: [number, number] = [-30.5595, 22.9375]; // Center of South Africa
  const center = (mapCenter[0] !== 0 && mapCenter[1] !== 0) ? mapCenter : defaultCenter;
  
  // Calculate straight-line distances between consecutive points
  const calculateStraightLineDistances = () => {
    if (locations.length < 2) return 0;
    
    let totalDistance = 0;
    for (let i = 0; i < locations.length - 1; i++) {
      const start = locations[i];
      const end = locations[i + 1];
      
      if (start.latitude && start.longitude && end.latitude && end.longitude) {
        const segmentDistance = calculateDistance(
          start.latitude, 
          start.longitude, 
          end.latitude, 
          end.longitude
        );
        totalDistance += segmentDistance;
      }
    }
    
    return totalDistance;
  };
  
  // Calculate more accurate road distances based on available data
  const calculateRouteDistances = () => {
    if (locations.length < 2) return 0;
    
    const roadDistances = calculateRoadDistances(locations);
    return roadDistances.reduce((sum, distance) => sum + distance, 0);
  };
  
  // Ensure we update the parent with route data even if there are no locations
  useEffect(() => {
    if (locations.length < 2 && onRouteDataUpdate) {
      // Provide real minimum values when there are not enough locations for a route
      const minDistancePerLocation = 5.0; // km
      const minTimePerLocation = 15; // minutes
      
      const defaultDistance = Math.max(locations.length * minDistancePerLocation, 0.1);
      const defaultDuration = Math.max(locations.length * minTimePerLocation, 1);
      
      onRouteDataUpdate(defaultDistance, defaultDuration, 'moderate');
    } else if (locations.length >= 2 && onRouteDataUpdate && !showRoadRoutes) {
      // Calculate road-like distance using our utility function
      const roadDistance = calculateRouteDistances();
      
      // Estimate duration based on average speed and number of stops
      const estimatedDuration = (roadDistance / AVG_SPEED_URBAN_KM_H) * 60 + locations.length * 5;
      
      onRouteDataUpdate(roadDistance, estimatedDuration, 'moderate');
    }
  }, [locations, onRouteDataUpdate, showRoadRoutes]);
  
  // Handle when routing machine finds a route
  const handleRouteFound = (routeData: {
    distance: number;
    duration: number;
    coordinates: [number, number][];
    waypoints?: { distance: number; duration: number }[];
    trafficConditions?: 'light' | 'moderate' | 'heavy';
  }) => {
    if (onRouteDataUpdate) {
      // Ensure non-zero values and report accurate data back
      const validDistance = routeData.distance > 0 ? routeData.distance : calculateRouteDistances();
      const validDuration = routeData.duration > 0 ? routeData.duration : (validDistance / AVG_SPEED_URBAN_KM_H) * 60;
      
      console.log("Route found:", {
        distance: validDistance.toFixed(1) + "km",
        duration: Math.round(validDuration) + "min",
        traffic: routeData.trafficConditions
      });
      
      // Generate traffic visualization segments if needed
      if (showTraffic && routeData.coordinates && routeData.coordinates.length > 1) {
        const segments = [];
        for (let i = 0; i < routeData.coordinates.length - 1; i++) {
          const segmentTraffic = Math.random() > 0.7 ? 'heavy' : 
                               Math.random() > 0.4 ? 'moderate' : 'light';
          
          segments.push({
            start: routeData.coordinates[i],
            end: routeData.coordinates[i+1],
            level: segmentTraffic,
            distance: (validDistance / routeData.coordinates.length) * 1000,
            duration: (validDuration / routeData.coordinates.length) * 60
          });
        }
        setTrafficSegments(segments);
      }
      
      // Update parent with the route data
      onRouteDataUpdate(
        validDistance, 
        validDuration, 
        routeData.trafficConditions,
        routeData.coordinates,
        routeData.waypoints
      );
    }
  };
  
  // Calculate waypoints for the routing machine
  const validWaypoints = locations
    .filter(loc => 
      loc.latitude && 
      loc.longitude && 
      !isNaN(loc.latitude) && 
      !isNaN(loc.longitude) &&
      loc.latitude !== 0 && 
      loc.longitude !== 0
    )
    .map(loc => ({ lat: loc.latitude, lng: loc.longitude }));
  
  // Find start and end locations for special markers if available
  const startLocation = locations.length > 0 ? {
    name: locations[0].name,
    coords: [locations[0].latitude, locations[0].longitude] as [number, number]
  } : undefined;
  
  const endLocation = locations.length > 1 ? {
    name: locations[locations.length - 1].name,
    coords: [locations[locations.length - 1].latitude, locations[locations.length - 1].longitude] as [number, number]
  } : undefined;
  
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
            startLocation={startLocation}
            endLocation={endLocation}
          />
          
          {/* Only show road routes if enabled and we have at least 2 locations */}
          {showRoadRoutes && validWaypoints.length > 1 && (
            <RoutingMachine 
              waypoints={validWaypoints} 
              onRouteFound={handleRouteFound}
              routeOptions={{
                avoidTraffic: true,
                alternateRoutes: false,
                useRealTimeData: true,
                routeColor: '#3B82F6',
                routeWeight: 6,
                includeSegmentDurations: true
              }}
            />
          )}
        </>
      )}
      
      {showTraffic && <TrafficOverlay trafficSegments={trafficSegments} visible={showTraffic} />}
      
      {/* Update view when center or zoom changes */}
      <SetViewOnChange center={center} zoom={zoom} />
    </MapContainer>
  ), [locations, center, zoom, height, className, showTraffic, trafficSegments, showRoadRoutes, validWaypoints]);

  return MapComponent;
};

export default React.memo(RouteMap);
