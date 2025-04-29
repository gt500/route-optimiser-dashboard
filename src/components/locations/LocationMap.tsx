
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { MapContainer, TileLayer } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import { LocationMarker } from '@/components/routes/map-components/LocationMarker';
import { LocationInfo, LeafletTileLayerProps } from '@/types/location';
import { useMapState } from '@/hooks/routes/useMapState';
import MapSetup from '@/components/routes/map-components/MapSetup';

interface LocationMapProps {
  locations: LocationInfo[];
}

const LocationMap: React.FC<LocationMapProps> = ({ locations }) => {
  const { bounds, mapCenter, zoom } = useMapState(locations);
  
  // Define default center if no locations or bounds calculated
  const defaultCenter: [number, number] = [-33.93, 18.52]; // Cape Town
  
  return (
    <Card className="bg-white">
      <CardHeader>
        <CardTitle className="text-black">Map View</CardTitle>
        <CardDescription>Visual overview of all locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          {/* Fix: Remove center and zoom from MapContainer and let MapSetup handle it */}
          <MapContainer 
            style={{ height: '100%', width: '100%' }}
          >
            {/* Using TileLayer with proper typing */}
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
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
              />
            ))}
          </MapContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;
