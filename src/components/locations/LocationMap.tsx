
import React, { useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationMarker } from '@/components/routes/map-components/LocationMarker';
import { LocationInfo } from '@/types/location';
import { useMapState } from '@/hooks/routes/useMapState';
import MapSetup from '@/components/routes/map-components/MapSetup';

interface LocationMapProps {
  locations: LocationInfo[];
}

const LocationMap: React.FC<LocationMapProps> = ({ locations }) => {
  const { bounds, mapCenter, zoom } = useMapState(locations);
  
  // Define default center if no locations or bounds calculated
  const defaultCenter: [number, number] = [-33.93, 18.52]; // Cape Town
  
  // Add useEffect to clean up Leaflet remnants when component unmounts
  useEffect(() => {
    // Clean up function that runs when component unmounts
    return () => {
      // Remove any leftover Leaflet containers
      const leafletContainers = document.querySelectorAll('.leaflet-container');
      leafletContainers.forEach(container => {
        if (!document.body.contains(container)) {
          container.remove();
        }
      });
      
      // Clean up any other Leaflet-related elements that might be lingering
      const leafletElements = document.querySelectorAll('.leaflet-control-container, .leaflet-pane');
      leafletElements.forEach(element => {
        if (!document.body.contains(element.parentElement)) {
          element.remove();
        }
      });
    };
  }, []);
  
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-black">Map View</CardTitle>
        <CardDescription>Visual overview of all locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <MapContainer 
            style={{ height: '100%', width: '100%' }}
            // Use as 'any' to bypass TypeScript errors
            {...({ center: defaultCenter, zoom: 12 } as any)}
            key="location-map" // Add a key to ensure re-rendering
          >
            {/* Using TileLayer with proper type cast */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              {...({} as any)}
            />
            
            <MapSetup 
              bounds={bounds} 
              center={mapCenter || defaultCenter}
              zoom={zoom}
            />
            
            {locations.map((location, index) => (
              <LocationMarker
                key={`location-marker-${location.id}-${index}`}
                id={location.id}
                name={location.name}
                position={[location.latitude, location.longitude]}
                address={location.address}
                index={index}
                stopNumber={index + 1} // Adding the stop number based on the location's index
              />
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;
