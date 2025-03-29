
import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { Truck, Home, MapPin } from 'lucide-react';

// Fix Leaflet icon issues
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
});

// Custom icons
const truckIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/3774/3774278.png',
  iconSize: [35, 35],
  iconAnchor: [17, 35],
  popupAnchor: [0, -35],
});

const homeIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/25/25694.png',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30],
});

const locationIcon = new L.Icon({
  iconUrl: 'https://cdn-icons-png.flaticon.com/512/1483/1483336.png',
  iconSize: [25, 25],
  iconAnchor: [12, 25],
  popupAnchor: [0, -25],
});

// Map bounds control component
const SetViewOnChange = ({ coordinates }: { coordinates: Array<[number, number]> }) => {
  const map = useMap();
  
  useEffect(() => {
    if (coordinates && coordinates.length > 0) {
      const bounds = L.latLngBounds(coordinates.map(coord => [coord[0], coord[1]]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [coordinates, map]);
  
  return null;
};

// Routing control component
const RoutingMachine = ({ waypoints }: { waypoints: Array<[number, number]> }) => {
  const map = useMap();

  useEffect(() => {
    if (!waypoints || waypoints.length < 2) return;

    const routingControl = L.Routing.control({
      waypoints: waypoints.map(wp => L.latLng(wp[0], wp[1])),
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: '#6366F1', weight: 4 }],
        extendToWaypoints: true,
        missingRouteTolerance: 0
      },
      createMarker: function() { return null; } // Disable default markers
    }).addTo(map);

    return () => {
      map.removeControl(routingControl);
    };
  }, [waypoints, map]);

  return null;
};

interface RouteMapProps {
  height?: string;
  width?: string;
  locations?: Array<{
    id: string | number;
    name: string;
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    address: string;
  }>;
  routes?: Array<{
    id: string;
    name: string;
    points: Array<[number, number]>;
  }>;
  selectedRouteId?: string;
  isEditable?: boolean;
  onLocationClick?: (locationId: string) => void;
  onMapClick?: (lat: number, lng: number) => void;
  depot?: {
    latitude?: number;
    longitude?: number;
    lat?: number;
    long?: number;
    name: string;
  };
  showRouting?: boolean;
  startLocation?: {
    name: string;
    coords: [number, number];
  };
  endLocation?: {
    name: string;
    coords: [number, number];
  };
  waypoints?: Array<{
    name: string;
    coords: [number, number];
  }>;
}

const RouteMap: React.FC<RouteMapProps> = ({
  height = '600px',
  width = '100%',
  locations = [],
  routes = [],
  selectedRouteId,
  isEditable = false,
  onLocationClick,
  onMapClick,
  depot = {
    latitude: -33.9258,
    longitude: 18.4232,
    name: 'Cape Town Depot'
  },
  showRouting = false,
  startLocation,
  endLocation,
  waypoints = []
}) => {
  // Default center if no locations or depot
  const defaultCenter: [number, number] = [-33.9258, 18.4232]; // Cape Town
  
  // Calculate center based on available data
  const [mapCenter, setMapCenter] = useState<[number, number]>(
    depot ? [depot.latitude || depot.lat || defaultCenter[0], depot.longitude || depot.long || defaultCenter[1]] : defaultCenter
  );
  
  // Collect all coordinates for bounds
  const allCoordinates: Array<[number, number]> = [];
  
  // Add depot coordinates
  if (depot) {
    allCoordinates.push([depot.latitude || depot.lat || defaultCenter[0], depot.longitude || depot.long || defaultCenter[1]]);
  }
  
  // Add location coordinates
  if (locations && locations.length > 0) {
    locations.forEach(loc => {
      allCoordinates.push([loc.latitude || loc.lat || 0, loc.longitude || loc.long || 0]);
    });
  }
  
  // Get selected route
  const selectedRoute = routes.find(route => route.id === selectedRouteId);
  const routeWaypoints = selectedRoute ? selectedRoute.points : [];
  
  // Handle routing waypoints
  const routingWaypoints = showRouting ? [] : routeWaypoints;

  // If explicit routing is requested, use provided waypoints
  if (showRouting) {
    if (startLocation) {
      routingWaypoints.push(startLocation.coords);
    }
    
    waypoints.forEach(wp => {
      routingWaypoints.push(wp.coords);
    });
    
    if (endLocation) {
      routingWaypoints.push(endLocation.coords);
    }
  }
  
  return (
    <div style={{ height, width }}>
      <MapContainer
        style={{ height: '100%', width: '100%' }}
        center={mapCenter}
        zoom={11}
        scrollWheelZoom
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {/* Add bounds controller */}
        <SetViewOnChange coordinates={allCoordinates} />
        
        {/* Add routing if a route is selected or explicit routing is requested */}
        {(selectedRoute || (showRouting && routingWaypoints.length >= 2)) && (
          <RoutingMachine waypoints={routingWaypoints} />
        )}
        
        {/* Add depot marker */}
        {depot && (
          <Marker 
            position={[depot.latitude || depot.lat || defaultCenter[0], depot.longitude || depot.long || defaultCenter[1]]}
            icon={homeIcon}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{depot.name}</h3>
                <p>Depot / Starting Point</p>
              </div>
            </Popup>
          </Marker>
        )}
        
        {/* Add location markers */}
        {locations.map(location => (
          <Marker 
            key={location.id.toString()}
            position={[location.latitude || location.lat || 0, location.longitude || location.long || 0]}
            icon={locationIcon}
            eventHandlers={{
              click: () => {
                if (onLocationClick) onLocationClick(location.id.toString());
              }
            }}
          >
            <Popup>
              <div>
                <h3 className="font-bold">{location.name}</h3>
                <p className="text-sm">{location.address}</p>
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
