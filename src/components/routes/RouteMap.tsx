
import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationInfo } from '@/types/location';
import { Button } from '@/components/ui/button';
import { useToast } from "@/components/ui/use-toast"
import { MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { TileLayerProps } from '@/hooks/fleet/types/routeTypes';
import { hasValidMapboxToken, getMapboxToken } from '@/utils/route/mapboxUtils';
import MapboxTokenInput from './map-components/MapboxTokenInput';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { LocationMarker } from './map-components/LocationMarker';

interface RouteMapProps {
  locations: LocationInfo[];
  routeCoordinates?: [number, number][];
  startLocation?: LocationInfo | null;
  endLocation?: LocationInfo | null;
  height?: string;
  showTraffic?: boolean;
  showRoadRoutes?: boolean;
  country?: string;
  region?: string;
  className?: string;
  routeName?: string;
  showStopMetrics?: boolean;
  onRouteDataUpdate?: (distance: number, duration: number, traffic?: 'light' | 'moderate' | 'heavy') => void;
}

const RouteMap: React.FC<RouteMapProps> = ({ 
  locations, 
  routeCoordinates = [], 
  startLocation = null, 
  endLocation = null,
  className = '',
  onRouteDataUpdate
}) => {
  const [map, setMap] = useState<L.Map | null>(null);
  const [showMapboxInput, setShowMapboxInput] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  // Initialize token check
  useEffect(() => {
    setShowMapboxInput(!hasValidMapboxToken());
  }, []);

  // Default map center and zoom
  const defaultCenter: [number, number] = [-33.93, 18.52];

  // Custom marker icon - blue for all markers
  const customIcon = (color: string = 'blue') => new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41]
  });

  useEffect(() => {
    if (map) {
      // Fit the map bounds to the route coordinates
      if (routeCoordinates && routeCoordinates.length > 0) {
        const bounds = L.latLngBounds(routeCoordinates);
        map.fitBounds(bounds);
      } else if (locations && locations.length > 0) {
        // If no route, fit to the locations
        const locationBounds = locations.map(loc => [loc.latitude, loc.longitude] as [number, number]);
        if (locationBounds.length > 0) {
          const bounds = L.latLngBounds(locationBounds);
          map.fitBounds(bounds);
        } else {
          // If no locations, set view to default center
          map.setView(defaultCenter, 12);
        }
      } else {
        // If no route or locations, set view to default center
        map.setView(defaultCenter, 12);
      }
    }
  }, [map, locations, routeCoordinates]);

  const handleLocationClick = (locationId: string) => {
    navigate(`/routes?highlightDelivery=${locationId}`, { state: { activeTab: 'active', highlightDelivery: locationId } });
    toast({
      title: "Navigating to delivery...",
      description: "Highlighting delivery on the Active Routes tab.",
    })
  };

  const handleMapboxTokenSet = () => {
    setShowMapboxInput(false);
    toast({
      title: "Mapbox token configured",
      description: "Route calculations will now use Mapbox for better accuracy.",
    });
  };

  return (
    <div className={`bg-white rounded-md p-4 shadow-md ${className}`}>
      <h2 className="text-lg font-semibold mb-2">Route Map</h2>
      
      {showMapboxInput && (
        <MapboxTokenInput onTokenSet={handleMapboxTokenSet} />
      )}
      
      <div style={{ height: '400px', width: '100%' }}>
        <MapContainer 
          style={{ height: '100%', width: '100%' }}
          // Use type casting to avoid TypeScript errors with center and zoom props
          whenReady={(mapInstance: any) => setMap(mapInstance.target)}
          attributionControl={false}
          // Type cast to avoid errors
          {...({ center: defaultCenter, zoom: 12 } as any)}
        >
          {/* Using TileLayer with proper type cast */}
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            {...({} as any)}
          />

          {/* Render polyline if route coordinates are available */}
          {routeCoordinates && routeCoordinates.length > 0 && (
            <Polyline positions={routeCoordinates} {...({ color: "blue" } as any)} />
          )}

          {/* Render start location marker */}
          {startLocation && (
            <LocationMarker
              id={startLocation.id}
              name={`Start: ${startLocation.name}`}
              position={[startLocation.latitude, startLocation.longitude]}
              address={startLocation.address}
              cylinders={0}
              stopNumber={0}
            />
          )}

          {/* Render end location marker */}
          {endLocation && (
            <LocationMarker
              id={endLocation.id}
              name={`End: ${endLocation.name}`}
              position={[endLocation.latitude, endLocation.longitude]}
              address={endLocation.address}
              cylinders={0}
              stopNumber={locations.length + 1}
            />
          )}

          {/* Render location markers */}
          {locations && locations.map((location, idx) => (
            <LocationMarker
              key={location.id} 
              id={location.id}
              name={location.name}
              position={[location.latitude, location.longitude]}
              address={location.address}
              cylinders={location.cylinders}
              stopNumber={idx + 1}
            />
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default RouteMap;
