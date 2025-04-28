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
import { 
  calculateSegmentDistances,
  calculateCompleteRoute 
} from '@/utils/route/routeCalculation';
import { getCurrentTrafficCondition } from '@/utils/route/trafficUtils';

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
  showRoadRoutes = true,
}) => {
  const { mapCenter, zoom } = useMapState(locations, country, region);
  const [trafficSegments, setTrafficSegments] = useState<any[]>([]);
  const [routeFound, setRouteFound] = useState<boolean>(false);
  
  const defaultCenter: [number, number] = [-30.5595, 22.9375];
  const center = (mapCenter[0] !== 0 && mapCenter[1] !== 0) ? mapCenter : defaultCenter;
  
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
  
  useEffect(() => {
    if (locations.length >= 2 && onRouteDataUpdate) {
      const waypoints = locations.map(loc => ({
        latitude: loc.latitude,
        longitude: loc.longitude
      }));
      
      calculateCompleteRoute(waypoints, region || "Cape Town")
        .then(result => {
          const routeCoordinates: [number, number][] = locations.map(loc => 
            [loc.latitude, loc.longitude] as [number, number]
          );
          
          const waypointData = [
            { distance: 0, duration: 0 },
            ...result.segments
          ];
          
          onRouteDataUpdate(
            result.totalDistance,
            result.totalDuration,
            result.trafficConditions,
            routeCoordinates,
            waypointData
          );
          
          if (showTraffic) {
            const segments: any[] = [];
            for (let i = 0; i < locations.length - 1; i++) {
              if (!locations[i].latitude || !locations[i].longitude || 
                  !locations[i+1].latitude || !locations[i+1].longitude) {
                continue;
              }
              
              segments.push({
                start: [locations[i].latitude, locations[i].longitude],
                end: [locations[i+1].latitude, locations[i+1].longitude],
                level: result.trafficConditions || (i % 3 === 0 ? 'moderate' : (i % 3 === 1 ? 'heavy' : 'light')),
                distance: result.segments[i]?.distance || 0,
                duration: result.segments[i]?.duration || 0
              });
            }
            setTrafficSegments(segments);
          }
          
          if (!routeFound) {
            toast.success(`Route calculated: ${result.totalDistance.toFixed(1)} km, ${Math.round(result.totalDuration)} min`);
            setRouteFound(true);
          }
        })
        .catch(error => {
          console.error("Error calculating route:", error);
          
          const minDistancePerLocation = 8.8;
          const minTimePerLocation = 16;
          
          const defaultDistance = Math.max(locations.length * minDistancePerLocation, 0.1);
          const defaultDuration = Math.max(locations.length * minTimePerLocation, 5);
          
          onRouteDataUpdate(defaultDistance, defaultDuration, 'moderate');
        });
    } else if (locations.length < 2 && onRouteDataUpdate) {
      const minDistancePerLocation = 8.8;
      const minTimePerLocation = 16;
      
      const defaultDistance = Math.max(locations.length * minDistancePerLocation, 0.1);
      const defaultDuration = Math.max(locations.length * minTimePerLocation, 5);
      
      onRouteDataUpdate(defaultDistance, defaultDuration, 'moderate');
      setRouteFound(false);
    }
  }, [locations, onRouteDataUpdate, region, showTraffic]);
  
  const handleRouteFound = (routeData: {
    distance: number;
    duration: number;
    coordinates: [number, number][];
    waypoints?: { distance: number; duration: number }[];
    trafficConditions?: 'light' | 'moderate' | 'heavy';
  }) => {
    if (onRouteDataUpdate) {
      const defaultTrafficCondition = getCurrentTrafficCondition();
      
      if (routeData.distance > 0 && routeData.duration > 0 && routeData.coordinates.length > 1) {
        let waypointData = routeData.waypoints;
        
        if (!waypointData || waypointData.length === 0) {
          waypointData = Array(locations.length).fill(0).map((_, i) => {
            if (i === 0) return { distance: 0, duration: 0 };
            
            return {
              distance: 8.8 + (Math.random() * 2 - 1),
              duration: 16 + (Math.random() * 4 - 2)
            };
          });
        }
        
        onRouteDataUpdate(
          routeData.distance, 
          routeData.duration, 
          routeData.trafficConditions || defaultTrafficCondition,
          routeData.coordinates,
          waypointData
        );
        
        setRouteFound(true);
        
        if (!routeFound) {
          toast.success(`Route calculated: ${routeData.distance.toFixed(1)} km, ${Math.round(routeData.duration)} min`);
        }
      }
    }
  };
  
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
  
  const startLocation = locations.length > 0 ? {
    name: locations[0].name,
    coords: [locations[0].latitude, locations[0].longitude] as [number, number]
  } : undefined;
  
  const endLocation = locations.length > 1 ? {
    name: locations[locations.length - 1].name,
    coords: [locations[locations.length - 1].latitude, locations[locations.length - 1].longitude] as [number, number]
  } : undefined;

  const MapComponent = React.useMemo(() => (
    <MapContainer
      style={{ height, width: '100%' }}
      className={`z-0 ${className}`}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {locations.length > 0 && (
        <>
          <RouteMarkers 
            locations={locations}
            waypoints={[]} 
            startLocation={startLocation}
            endLocation={endLocation}
          />
          
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
      
      <SetViewOnChange center={center} zoom={zoom} />
    </MapContainer>
  ), [locations, center, zoom, height, className, showTraffic, trafficSegments, showRoadRoutes, validWaypoints, routeFound]);

  return MapComponent;
};

export default React.memo(RouteMap);
