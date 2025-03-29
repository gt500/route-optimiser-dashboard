
import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

// Define marker icons
const startIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const endIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

const waypointIcon = new L.Icon({
  iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

// Sample location data
const locations = [
  { 
    id: 1, 
    name: 'Afrox Epping Depot', 
    description: 'Industrial gas supplier', 
    address: '121 Bofors Circle, Epping Industria 2, Cape Town', 
    coords: [-33.927771, 18.535212],
    type: 'start'
  },
  { 
    id: 2, 
    name: 'Food Lovers Sunningdale', 
    description: 'Grocery store', 
    address: 'Sunningdale Shopping Centre, Sunningdale, Cape Town', 
    coords: [-33.796696, 18.482478],
    type: 'waypoint'
  },
  { 
    id: 3, 
    name: 'Pick n Pay TableView', 
    description: 'Grocery store', 
    address: 'Bayside Mall, Blaauwberg Rd, Table View, Cape Town', 
    coords: [-33.825340, 18.485180],
    type: 'waypoint'
  },
  { 
    id: 4, 
    name: 'SUPERSPAR Parklands', 
    description: 'Grocery store', 
    address: 'Village Square, Parklands Main Rd, Parklands, Cape Town', 
    coords: [-33.817554, 18.488649],
    type: 'waypoint'
  },
  { 
    id: 5, 
    name: 'West Coast Village', 
    description: 'Shopping center', 
    address: 'West Coast Village Shopping Centre, West Coast, Cape Town', 
    coords: [-33.827917, 18.487117],
    type: 'end'
  }
];

interface RouteMapProps {
  startLocation?: { name: string; coords: [number, number] };
  endLocation?: { name: string; coords: [number, number] };
  waypoints?: { name: string; coords: [number, number] }[];
  showRouting?: boolean;
  allowSelection?: boolean;
  onLocationSelect?: (location: any) => void;
  locations?: any[];
}

// Component to initialize routing after the map is loaded
const RoutingMachine: React.FC<{
  startLocation?: { coords: [number, number] };
  endLocation?: { coords: [number, number] };
  waypoints?: { coords: [number, number] }[];
  showRouting: boolean;
}> = ({ startLocation, endLocation, waypoints = [], showRouting }) => {
  const map = useMap();
  
  useEffect(() => {
    if (showRouting && startLocation && endLocation) {
      const routingControl = L.Routing.control({
        waypoints: [
          L.latLng(startLocation.coords[0], startLocation.coords[1]),
          ...waypoints.map(wp => L.latLng(wp.coords[0], wp.coords[1])),
          L.latLng(endLocation.coords[0], endLocation.coords[1])
        ],
        routeWhileDragging: false,
        showAlternatives: true,
        fitSelectedRoutes: true,
        show: false, // Hide the routing instructions
        lineOptions: {
          styles: [{ color: '#6366F1', opacity: 0.8, weight: 6 }]
        },
        altLineOptions: {
          styles: [{ color: '#D1D5DB', opacity: 0.8, weight: 6 }]
        }
      }).addTo(map);

      // Hide the routing container
      const routingContainer = document.querySelector('.leaflet-routing-container');
      if (routingContainer) {
        routingContainer.classList.add('hidden');
      }
      
      return () => {
        map.removeControl(routingControl);
      };
    }
  }, [map, startLocation, endLocation, waypoints, showRouting]);
  
  return null;
};

const RouteMap: React.FC<RouteMapProps> = ({
  startLocation,
  endLocation,
  waypoints = [],
  showRouting = false,
  allowSelection = false,
  onLocationSelect,
  locations: customLocations
}) => {
  const navigate = useNavigate();
  
  // Use Cape Town as default center if no points are provided
  const defaultCenter: [number, number] = [-33.915538, 18.572645];
  
  // If we have a start and end, calculate center point between them
  const calculateCenterAndZoom = () => {
    if (startLocation && endLocation) {
      const lat = (startLocation.coords[0] + endLocation.coords[0]) / 2;
      const lng = (startLocation.coords[1] + endLocation.coords[1]) / 2;
      return [lat, lng] as [number, number];
    }
    
    if (startLocation) {
      return startLocation.coords;
    }
    
    if (endLocation) {
      return endLocation.coords;
    }
    
    return defaultCenter;
  };

  const center = calculateCenterAndZoom();

  const getMarkerIcon = (type: string) => {
    switch (type) {
      case 'start':
        return startIcon;
      case 'end':
        return endIcon;
      default:
        return waypointIcon;
    }
  };

  // Determine which locations to display
  const displayLocations = customLocations || locations;

  return (
    <div className="h-full w-full rounded-md overflow-hidden border">
      <MapContainer 
        center={center}
        zoom={11}
        style={{ height: '100%', width: '100%' }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        
        {showRouting && startLocation && endLocation && (
          <RoutingMachine 
            startLocation={startLocation}
            endLocation={endLocation}
            waypoints={waypoints}
            showRouting={showRouting}
          />
        )}
        
        {/* Display markers for all locations */}
        {displayLocations && displayLocations.map((location) => {
          // Convert location to needed format if it's from the Locations page
          const coords = location.coords || [location.lat, location.long];
          const locationType = location.type?.toLowerCase() === 'storage' ? 'start' : 'waypoint';
          
          return (
            <Marker 
              key={location.id}
              position={coords as [number, number]}
              icon={getMarkerIcon(location.type || locationType)}
            >
              <Popup>
                <div className="p-1">
                  <h3 className="font-semibold">{location.name}</h3>
                  <p className="text-sm text-gray-600">{location.description || location.type}</p>
                  <p className="text-xs text-gray-500">{location.address}</p>
                  {allowSelection && (
                    <Button 
                      size="sm" 
                      className="mt-2 w-full" 
                      onClick={() => onLocationSelect && onLocationSelect(location)}
                    >
                      Select
                    </Button>
                  )}
                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};

export default RouteMap;
