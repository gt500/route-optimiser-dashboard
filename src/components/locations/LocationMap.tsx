
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import RouteMap from '@/components/routes/RouteMap';
import { LocationInfo } from '@/types/location';

interface LocationMapProps {
  locations: LocationInfo[];
}

const LocationMap: React.FC<LocationMapProps> = ({ locations }) => {
  return (
    <Card className="bg-black">
      <CardHeader>
        <CardTitle>Map View</CardTitle>
        <CardDescription>Visual overview of all locations</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[400px]">
          <RouteMap 
            locations={locations.map(loc => ({
              id: loc.id.toString(),
              name: loc.name,
              latitude: loc.latitude,
              longitude: loc.longitude,
              address: loc.address
            }))} 
            height="100%"
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default LocationMap;
