
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { LocationType } from '../locations/LocationEditDialog';
import { MapPin } from 'lucide-react';

interface RouteEndpointsProps {
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  availableLocations: LocationType[];
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  isLoadingLocations?: boolean;
  isDisabled?: boolean;
}

const RouteEndpoints = ({
  availableLocations,
  startLocation,
  endLocation,
  onStartLocationChange,
  onEndLocationChange,
  isLoadingLocations = false,
  isDisabled = false,
}: RouteEndpointsProps) => {
  // Identify storage/warehouses (Afrox depot, Shell stations)
  const warehouses = availableLocations.filter(loc => 
    loc.type === 'Storage' || 
    loc.name.toLowerCase().includes('afrox') || 
    loc.name.toLowerCase().includes('shell') || 
    loc.name.toLowerCase().includes('depot')
  );
  
  const allLocations = availableLocations;

  return (
    <Card className="shadow-sm bg-black">
      <CardHeader>
        <CardTitle className="text-base text-white">Route Endpoints</CardTitle>
        <CardDescription className="text-gray-300">Set your starting and ending locations</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="start-location" className="text-white">Start Location</Label>
          <Select
            value={startLocation?.id?.toString() || ""}
            onValueChange={onStartLocationChange}
            disabled={isDisabled || isLoadingLocations}
          >
            <SelectTrigger id="start-location" className="w-full">
              <SelectValue placeholder="Select start location" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {warehouses.map((location) => (
                <SelectItem key={`start-${location.id.toString()}`} value={location.id.toString()}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{location.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-300">Select a warehouse or depot as your starting point</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="end-location" className="text-white">End Location</Label>
          <Select
            value={endLocation?.id?.toString() || ""}
            onValueChange={onEndLocationChange}
            disabled={isDisabled || isLoadingLocations}
          >
            <SelectTrigger id="end-location" className="w-full">
              <SelectValue placeholder="Select end location" />
            </SelectTrigger>
            <SelectContent className="bg-popover">
              {allLocations.map((location) => (
                <SelectItem key={`end-${location.id.toString()}`} value={location.id.toString()}>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4" />
                    <span>{location.name}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <p className="text-xs text-gray-300">Choose where your route will end</p>
        </div>
      </CardContent>
    </Card>
  );
};

export default RouteEndpoints;
