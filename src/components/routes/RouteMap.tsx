
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Tooltip, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { toast } from 'sonner';

// Need to fix leaflet icon issues
import iconRetinaUrl from 'leaflet/dist/images/marker-icon-2x.png';
import iconUrl from 'leaflet/dist/images/marker-icon.png';
import shadowUrl from 'leaflet/dist/images/marker-shadow.png';

// Define location icons for different types and priorities
const createLocationIcon = (color: string, priority: number = 0) => {
  return L.divIcon({
    className: `custom-marker-icon priority-${priority}`,
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; justify-content: center; align-items: center; color: white; border: 2px solid white; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">${priority ? priority : ''}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

// Fix default marker icons not loading
const fixDefaultIcons = () => {
  const DefaultIcon = L.icon({
    iconRetinaUrl,
    iconUrl,
    shadowUrl,
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    tooltipAnchor: [16, -28],
    shadowSize: [41, 41]
  });
  L.Marker.prototype.options.icon = DefaultIcon;
};

// Set up icons for different location types
const depotIcon = createLocationIcon('#2563eb');
const customerIcon = createLocationIcon('#f97316');

// Set up different priority icons
const priorityIcons = [
  createLocationIcon('#10b981', 1), // First priority - green
  createLocationIcon('#3b82f6', 2), // Second priority - blue
  createLocationIcon('#6366f1', 3), // Third priority - indigo
  createLocationIcon('#8b5cf6', 4), // Fourth priority - purple
  createLocationIcon('#ec4899', 5), // Fifth priority - pink
];

// Component to handle routing between points
const RoutingMachine = ({ waypoints }: { waypoints: L.LatLng[] }) => {
  const map = useMap();
  
  useEffect(() => {
    if (!map || waypoints.length < 2) return;
    
    // Remove any existing routing control
    map.eachLayer((layer) => {
      if (layer instanceof L.Routing.Control) {
        map.removeLayer(layer);
      }
    });
    
    // Create and add new routing control
    const routingControl = L.Routing.control({
      waypoints,
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [
          { color: '#6366F1', opacity: 0.8, weight: 6 },
          { color: '#818CF8', opacity: 0.5, weight: 2 }
        ],
        extendToWaypoints: true,
        missingRouteTolerance: 10
      },
      createMarker: () => null, // Don't create default markers
      addWaypoints: false, // Prevent adding waypoints by clicking on the map
    }).addTo(map);
    
    // Hide the routing instructions
    const container = routingControl.getContainer();
    if (container) {
      container.style.display = 'none';
    }
    
    // Fix the map view to include all waypoints
    setTimeout(() => {
      const bounds = L.latLngBounds(waypoints);
      map.fitBounds(bounds, { padding: [50, 50] });
    }, 500);
    
    return () => {
      map.removeControl(routingControl);
    };
  }, [map, waypoints]);
  
  return null;
};

// Define the props interface for RouteMap
interface RouteMapProps {
  route: {
    locations: {
      id: number;
      name: string;
      lat?: number;
      long?: number;
      type?: string;
      emptyCylinders?: number;
    }[];
    distance: number;
    estimatedDuration: number;
    trafficConditions: 'light' | 'moderate' | 'heavy';
    usingRealTimeData: boolean;
    fuelConsumption: number;
    fuelCost: number;
  } | null;
}

const RouteMap: React.FC<RouteMapProps> = ({ route }) => {
  // Initialize leaflet icons once
  useEffect(() => {
    fixDefaultIcons();
  }, []);
  
  if (!route || route.locations.length < 1) {
    return (
      <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center rounded-md border border-dashed">
        <p className="text-gray-500">Select locations to visualize the route</p>
      </div>
    );
  }
  
  // Filter out locations that don't have latitude/longitude
  const validLocations = route.locations.filter(
    loc => typeof loc.lat === 'number' && typeof loc.long === 'number'
  );
  
  if (validLocations.length === 0) {
    toast.error("No valid coordinates found for the selected locations");
    
    return (
      <div className="h-[400px] w-full bg-gray-100 flex items-center justify-center rounded-md border border-dashed">
        <p className="text-gray-500">No valid coordinates for selected locations</p>
      </div>
    );
  }
  
  // Use the first location as center if available, otherwise use Cape Town
  const center: [number, number] = validLocations.length > 0 
    ? [validLocations[0].lat || -33.9249, validLocations[0].long || 18.4241] 
    : [-33.9249, 18.4241]; // Cape Town coordinates
  
  // Create waypoints for routing
  const waypoints = validLocations.map(
    loc => new L.LatLng(loc.lat || 0, loc.long || 0)
  );
  
  return (
    <div className="h-[400px] w-full rounded-md overflow-hidden border">
      <MapContainer 
        center={center}
        zoom={10} 
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {validLocations.map((location, index) => (
          <Marker 
            key={location.id} 
            position={[location.lat || 0, location.long || 0]}
            icon={
              index === 0 || index === validLocations.length - 1
                ? (location.type === 'Storage' ? depotIcon : customerIcon)
                : (index < 6 ? priorityIcons[index - 1] : priorityIcons[4])
            }
          >
            <Tooltip permanent={false} offset={[0, -10]}>
              {location.name}
            </Tooltip>
            <Popup>
              <div className="text-sm">
                <p className="font-semibold">{location.name}</p>
                <p>Type: {location.type || 'Customer'}</p>
                {location.emptyCylinders !== undefined && (
                  <p>Cylinders: {location.emptyCylinders}</p>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
        
        {waypoints.length >= 2 && <RoutingMachine waypoints={waypoints} />}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
