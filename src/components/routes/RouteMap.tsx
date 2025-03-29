
import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Map as MapIcon, AlertTriangle, CreditCard, Ruler } from 'lucide-react';
import { LocationType } from '../locations/LocationEditDialog';
import { MapContainer, TileLayer, Marker, Popup, useMap, Tooltip } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import 'leaflet-routing-machine';

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
    priority?: 'low' | 'medium' | 'high';
  } | null;
}

// Custom marker icons for different priority levels
const priorityIcons = {
  high: new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-priority-high'
  }),
  medium: new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-priority-medium'
  }),
  low: new L.Icon({
    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
    className: 'marker-priority-low'
  })
};

const RouteMap = ({ route }: RouteMapProps) => {
  const [mapCenter, setMapCenter] = useState<[number, number]>([-33.9249, 18.4241]); // Cape Town default

  useEffect(() => {
    if (route && route.locations.length > 0) {
      // Calculate the center of all locations
      const latSum = route.locations.reduce((sum, loc) => sum + (loc.lat || 0), 0);
      const longSum = route.locations.reduce((sum, loc) => sum + (loc.long || 0), 0);
      const centerLat = latSum / route.locations.length;
      const centerLong = longSum / route.locations.length;
      
      setMapCenter([centerLat, centerLong]);
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

  // Function to determine marker priority based on position in route
  const getMarkerPriority = (index: number, total: number): 'high' | 'medium' | 'low' => {
    if (index === 0) return 'high'; // Start location
    if (index === total - 1 && total > 1) return 'high'; // End location
    if (index <= Math.ceil(total * 0.3)) return 'high';
    if (index <= Math.ceil(total * 0.7)) return 'medium';
    return 'low';
  };

  // Component to add the routing control to the map
  const RoutingMachineLayer = ({ locations }: { locations: LocationType[] }) => {
    const map = useMap();
    
    React.useEffect(() => {
      if (!map || locations.length < 2) return;
      
      const waypoints = locations.map(loc => L.latLng(loc.lat || 0, loc.long || 0));
      
      // Remove any existing routing control
      const container = map.getContainer();
      const existingRoutingControls = container.getElementsByClassName('leaflet-routing-container');
      while(existingRoutingControls[0]) {
        existingRoutingControls[0].remove();
      }
      
      // Add the new routing control to show actual roads between waypoints
      const routingControl = L.Routing.control({
        waypoints,
        lineOptions: {
          styles: [{ color: getTrafficColor(route?.trafficConditions), weight: 4 }],
          extendToWaypoints: true,
          missingRouteTolerance: 0
        },
        addWaypoints: false,
        draggableWaypoints: false,
        fitSelectedRoutes: true,
        showAlternatives: false,
        routeWhileDragging: false,
        router: L.Routing.osrmv1({
          serviceUrl: 'https://router.project-osrm.org/route/v1',
          profile: 'driving'
        })
      }).addTo(map);
      
      // Remove the default routing container that shows turn-by-turn directions
      routingControl.on('routesfound', function() {
        const container = document.getElementsByClassName('leaflet-routing-container')[0] as HTMLElement;
        if (container) {
          container.style.display = 'none';
        }
      });
      
      return () => {
        map.removeControl(routingControl);
      };
    }, [map, locations]);
    
    return null;
  };

  // Add custom CSS for marker priority styling
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      .marker-priority-high .leaflet-marker-icon {
        filter: hue-rotate(240deg) saturate(1.5);
        z-index: 1000 !important;
      }
      .marker-priority-medium .leaflet-marker-icon {
        filter: hue-rotate(120deg) saturate(1.2);
        z-index: 900 !important;
      }
      .marker-priority-low .leaflet-marker-icon {
        filter: grayscale(0.5);
        z-index: 800 !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="h-[400px] bg-slate-100 dark:bg-slate-900 rounded-lg relative overflow-hidden border border-border shadow-sm">
      {route && route.locations.length > 0 ? (
        <div className="w-full h-full">
          <MapContainer 
            center={mapCenter}
            zoom={10}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {route.locations.map((location, idx) => (
              <Marker 
                key={idx} 
                position={[location.lat || 0, location.long || 0]}
                icon={priorityIcons[getMarkerPriority(idx, route.locations.length)]}
              >
                <Tooltip 
                  direction="top" 
                  offset={[0, -35]}
                >
                  {location.name}
                </Tooltip>
                <Popup>
                  <div className="text-sm font-medium">{location.name}</div>
                  <div className="text-xs">{location.address}</div>
                  <div className="text-xs mt-1">
                    {location.type === 'Customer' && location.emptyCylinders && 
                      <span>Empty cylinders: {location.emptyCylinders}</span>
                    }
                    {location.type === 'Storage' && location.fullCylinders && 
                      <span>Full cylinders: {location.fullCylinders}</span>
                    }
                  </div>
                </Popup>
              </Marker>
            ))}
            
            {route.locations.length >= 2 && (
              <RoutingMachineLayer locations={route.locations} />
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
                      <span className="flex items-center gap-1" style={{ color: getTrafficColor(route.trafficConditions) }}>
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
