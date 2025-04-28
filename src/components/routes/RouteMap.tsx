
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
import { calculateRoadDistances, calculateSegmentDistances } from '@/utils/route/routeCalculation';

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
  const [routeFound, setRouteFound] = useState<boolean>(false);
  
  // Setup default map center for South Africa if no specific locations
  const defaultCenter: [number, number] = [-30.5595, 22.9375]; // Center of South Africa
  const center = (mapCenter[0] !== 0 && mapCenter[1] !== 0) ? mapCenter : defaultCenter;
  
  // Calculate detailed segment distances for debugging
  useEffect(() => {
    if (locations.length >= 2) {
      const segmentInfo = calculateSegmentDistances(locations);
      console.log('Segment distance breakdown:', segmentInfo.map((seg, i) => {
        const from = locations[i].name;
        const to = locations[i+1].name;
        return `${from} → ${to}: Direct ${seg.direct.toFixed(1)}km, Road ${seg.road.toFixed(1)}km`;
      }));
    }
  }, [locations]);
  
  // Calculate more accurate road distances based on available data
  const calculateRouteDistances = () => {
    if (locations.length < 2) return 0;
    
    const roadDistances = calculateRoadDistances(locations);
    const totalDistance = roadDistances.reduce((sum, distance) => sum + distance, 0);
    
    console.log(`Total calculated road distance: ${totalDistance.toFixed(1)}km`);
    return totalDistance;
  };
  
  // Ensure we update the parent with route data even if there are no locations
  useEffect(() => {
    if (locations.length < 2 && onRouteDataUpdate) {
      // Provide realistic minimum values when there are not enough locations for a route
      const minDistancePerLocation = 15.0; // km - increased for more realism
      const minTimePerLocation = 20; // minutes - increased for more realism
      
      const defaultDistance = Math.max(locations.length * minDistancePerLocation, 0.1);
      const defaultDuration = Math.max(locations.length * minTimePerLocation, 5);
      
      onRouteDataUpdate(defaultDistance, defaultDuration, 'moderate');
      setRouteFound(false);
    } else if (locations.length >= 2 && onRouteDataUpdate && !showRoadRoutes) {
      // Calculate road-like distance using our utility function
      const roadDistance = calculateRouteDistances();
      
      // Estimate duration based on average speed and number of stops
      const estimatedDuration = (roadDistance / AVG_SPEED_URBAN_KM_H) * 60 + locations.length * 8;
      
      onRouteDataUpdate(roadDistance, estimatedDuration, 'moderate');
      setRouteFound(false);
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
      // Fallback to calculated values if routing machine returns invalid data
      const calculatedDistance = calculateRouteDistances();
      
      // Ensure non-zero values and report accurate data back
      let validDistance: number;
      let validDuration: number;
      
      // If routing machine returned valid data, use it with a sanity check
      if (routeData.distance > 0) {
        validDistance = routeData.distance;
        // If the routing machine distance is drastically different from our calculation (more than 50% difference),
        // log a warning but still use the routing machine value as it's likely more accurate
        if (Math.abs(validDistance - calculatedDistance) / calculatedDistance > 0.5) {
          console.warn(`Routing machine distance (${validDistance.toFixed(1)}km) differs significantly from calculation (${calculatedDistance.toFixed(1)}km)`);
        }
      } else {
        // Fallback to calculated distance
        validDistance = calculatedDistance;
      }
      
      // Similarly for duration
      if (routeData.duration > 0) {
        validDuration = routeData.duration;
      } else {
        // Calculate duration based on the distance with reasonable speed assumptions
        validDuration = (validDistance / AVG_SPEED_URBAN_KM_H) * 60 + locations.length * 8;
      }
      
      console.log("Route found:", {
        distance: validDistance.toFixed(1) + "km",
        duration: Math.round(validDuration) + "min",
        traffic: routeData.trafficConditions,
        waypoints: routeData.waypoints?.length || 0
      });
      
      // Generate traffic visualization segments if needed
      if (showTraffic && routeData.coordinates && routeData.coordinates.length > 1) {
        const segments = [];
        let prevTraffic = 'moderate';
        
        for (let i = 0; i < routeData.coordinates.length - 1; i++) {
          // Make traffic conditions more realistic by considering trends
          // Make traffic consistent for stretches with occasional changes
          let segmentTraffic;
          if (Math.random() > 0.85) {
            // Only change traffic conditions occasionally
            const r = Math.random();
            segmentTraffic = r > 0.6 ? 'heavy' : r > 0.3 ? 'moderate' : 'light';
            prevTraffic = segmentTraffic;
          } else {
            segmentTraffic = prevTraffic;
          }
          
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
      
      setRouteFound(true);
      
      // If this is the first time we found a route, show a toast to confirm
      if (!routeFound) {
        toast.success(`Route calculated: ${validDistance.toFixed(1)} km, ${Math.round(validDuration)} min`);
      }
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
  ), [locations, center, zoom, height, className, showTraffic, trafficSegments, showRoadRoutes, validWaypoints, routeFound]);

  return MapComponent;
};

export default React.memo(RouteMap);
