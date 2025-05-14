
import React from 'react';
import { LocationType } from '@/types/location';

interface RouteEndpointsProps {
  availableLocations: LocationType[];
  startLocation: LocationType | null;
  endLocation: LocationType | null;
  onStartLocationChange: (locationId: string) => void;
  onEndLocationChange: (locationId: string) => void;
  allowSameStartEndLocation?: boolean;
}

const RouteEndpoints: React.FC<RouteEndpointsProps> = ({
  availableLocations,
  startLocation,
  endLocation,
  onStartLocationChange,
  onEndLocationChange,
  allowSameStartEndLocation = false
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium mb-1">Start Location</label>
        <select
          value={startLocation?.id || ''}
          onChange={(e) => onStartLocationChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="">Select Start Location</option>
          {availableLocations
            .filter((loc) => loc.type === 'Storage' || 
                            (allowSameStartEndLocation ? true : loc.id !== endLocation?.id))
            .map((location) => (
              <option key={`start-${location.id}`} value={location.id}>
                {location.name}
              </option>
            ))}
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">End Location</label>
        <select
          value={endLocation?.id || ''}
          onChange={(e) => onEndLocationChange(e.target.value)}
          className="w-full rounded-md border border-input bg-background px-3 py-2"
        >
          <option value="">Select End Location</option>
          {availableLocations
            .filter((loc) => 
              allowSameStartEndLocation ? true : loc.id !== startLocation?.id)
            .map((location) => (
              <option key={`end-${location.id}`} value={location.id}>
                {location.name}
              </option>
            ))}
        </select>
      </div>
    </div>
  );
};

export default RouteEndpoints;
