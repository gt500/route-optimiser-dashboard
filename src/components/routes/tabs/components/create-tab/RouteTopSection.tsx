
import React from 'react';
import { Card } from '@/components/ui/card';
import RouteEndpoints from '@/components/routes/RouteEndpoints';
import RouteMap from '@/components/routes/RouteMap';
import { LocationType, LocationInfo } from '@/types/location';

interface RouteTopSectionProps {
  availableLocations: LocationType[];
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  isLoadingLocations: boolean;
  isDisabled: boolean;
  selectedCountry: string;
  selectedRegion: string;
  displayLocations: LocationInfo[];
  onRouteDataUpdate: (
    distance: number, 
    duration: number, 
    trafficConditions?: 'light' | 'moderate' | 'heavy',
    coordinates?: [number, number][],
    waypointData?: { distance: number; duration: number }[]
  ) => void;
  getRouteName: () => string;
}

export const RouteTopSection: React.FC<RouteTopSectionProps> = ({
  availableLocations,
  startLocation,
  endLocation,
  onStartLocationChange,
  onEndLocationChange,
  isLoadingLocations,
  isDisabled,
  selectedCountry,
  selectedRegion,
  displayLocations,
  onRouteDataUpdate,
  getRouteName
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      <div className="col-span-1">
        <RouteEndpoints
          availableLocations={availableLocations}
          startLocation={startLocation}
          endLocation={endLocation}
          onStartLocationChange={onStartLocationChange}
          onEndLocationChange={onEndLocationChange}
          isLoadingLocations={isLoadingLocations}
          isDisabled={isDisabled}
          selectedCountry={selectedCountry}
          selectedRegion={selectedRegion}
        />
      </div>

      <div className="md:col-span-2">
        <Card className="h-full overflow-hidden">
          <RouteMap 
            locations={displayLocations}
            className="h-full"
            height="250px"
            onRouteDataUpdate={onRouteDataUpdate}
            showTraffic={true}
            country={selectedCountry}
            region={selectedRegion}
            routeName={getRouteName()}
            showStopMetrics={true}
          />
        </Card>
      </div>
    </div>
  );
};
