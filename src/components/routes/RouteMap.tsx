
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Map as MapIcon, AlertTriangle, CreditCard, Ruler } from 'lucide-react';
import { LocationType } from '../locations/LocationEditDialog';
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix Leaflet icon issues
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

interface RouteMapProps {
  route: {
    locations: LocationType[];
    distance: number;
    estimatedDuration?: number;
    trafficConditions?: 'light' | 'moderate' | 'heavy';
    usingRealTimeData?: boolean;
    fuelConsumption?: number;
    fuelCost?: number;
  } | null;
}

const RouteMap = ({ route }: RouteMapProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.9249, 18.4241]); // Cape Town default
  const [routePath, setRoutePath] = useState<[number, number][]>([]);

  useEffect(() => {
    if (route && route.locations.length > 0) {
      // Calculate the center of all locations
      const latSum = route.locations.reduce((sum, loc) => sum + (loc.lat || 0), 0);
      const longSum = route.locations.reduce((sum, loc) => sum + (loc.long || 0), 0);
      const centerLat = latSum / route.locations.length;
      const centerLong = longSum / route.locations.length;
      
      setMapCenter([centerLat, centerLong]);

      // Create path for the route (for now just direct lines, we'd need a routing API for actual roads)
      const path = route.locations.map(loc => [loc.lat || 0, loc.long || 0] as [number, number]);
      setRoutePath(path);
    }
  }, [route]);

  const getTrafficColor = (condition?: 'light' | 'moderate' | 'heavy') => {
    switch (condition) {
      case 'light': return '#10b981'; // emerald-500
      case 'moderate': return '#f59e0b'; // amber-500
      case 'heavy': return '#ef4444'; // red-500
      default: return '#3b82f6'; // blue-500
    }
  };

  return (
    <div className="h-[400px] bg-slate-100 dark:bg-slate-900 rounded-lg relative overflow-hidden border border-border shadow-sm">
      {route && route.locations.length > 0 ? (
        <div className="w-full h-full">
          <MapContainer 
            key={mapCenter.toString()}
            style={{ height: '100%', width: '100%' }}
            zoomControl={false}
            zoom={10}
            center={mapCenter}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {route.locations.map((location, idx) => (
              <Marker 
                key={idx} 
                position={[location.lat || 0, location.long || 0]}
              >
                <Popup>
                  <div className="text-sm font-medium">{location.name}</div>
                  <div className="text-xs">{location.address}</div>
                </Popup>
              </Marker>
            ))}
            
            {routePath.length > 1 && (
              <Polyline 
                positions={routePath}
                pathOptions={{
                  color: getTrafficColor(route.trafficConditions),
                  weight: 4
                }}
              />
            )}
          </MapContainer>
          
          <div className="absolute bottom-4 right-4 z-[1000]">
            <Card className="w-auto bg-background/90 backdrop-blur-sm shadow-md">
              <CardContent className="p-3">
                <div className="flex flex-col gap-2 text-sm">
                  <div className="flex items-center gap-2">
                    <Ruler className="h-3 w-3" />
                    <span className="font-medium">Distance:</span> 
                    <span className="text-muted-foreground">{route.distance.toFixed(1)} km</span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-3 w-3" />
                    <span className="font-medium">Cost:</span> 
                    <span className="text-muted-foreground">
                      R {route.fuelCost ? route.fuelCost.toFixed(2) : ((route.distance * 22 * 0.12).toFixed(2))}
                    </span>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="font-medium">Time:</span>
                    <span className="text-muted-foreground">
                      {route.estimatedDuration || Math.round(route.distance * 1.5)} min
                    </span>
                    
                    {route.trafficConditions && (
                      <span className={`flex items-center gap-1`} style={{ color: getTrafficColor(route.trafficConditions) }}>
                        {route.trafficConditions === 'heavy' && <AlertTriangle className="h-3 w-3" />}
                        {route.trafficConditions.charAt(0).toUpperCase() + route.trafficConditions.slice(1)} traffic
                      </span>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-secondary/50">
          <div className="text-center space-y-3">
            <MapIcon className="h-12 w-12 mx-auto text-muted-foreground" />
            <p className="text-muted-foreground">Map visualization will appear here</p>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">Select locations and define a route to see the optimized path</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default RouteMap;
