
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
  const { toast } = useToast();
  const navigate = useNavigate();

  // Default map center and zoom
  const defaultCenter: [number, number] = [-33.93, 18.52];

  // Custom marker icon
  const customIcon = (color: string) => new L.Icon({
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

  return (
    <div className={`bg-white rounded-md p-4 shadow-md ${className}`}>
      <h2 className="text-lg font-semibold mb-2">Route Map</h2>
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
            <Marker 
              position={[startLocation.latitude, startLocation.longitude]} 
              {...({ icon: customIcon('green') } as any)}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold">{startLocation.name}</h3>
                  <p className="text-sm">{startLocation.address}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render end location marker */}
          {endLocation && (
            <Marker 
              position={[endLocation.latitude, endLocation.longitude]} 
              {...({ icon: customIcon('red') } as any)}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold">{endLocation.name}</h3>
                  <p className="text-sm">{endLocation.address}</p>
                </div>
              </Popup>
            </Marker>
          )}

          {/* Render location markers */}
          {locations && locations.map((location) => (
            <Marker 
              key={location.id} 
              position={[location.latitude, location.longitude]}
              {...({ icon: customIcon('grey') } as any)}
            >
              <Popup>
                <div className="text-center">
                  <h3 className="font-semibold">{location.name}</h3>
                  <p className="text-sm">{location.address}</p>
                  <Button 
                    variant="secondary" 
                    size="sm"
                    className="mt-2"
                    onClick={() => handleLocationClick(location.id)}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    View Deliveries
                  </Button>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default RouteMap;
