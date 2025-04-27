
import React from 'react';
import { LocationPoint, NamedCoords } from '@/types/location';
import DepotMarker from './DepotMarker';
import LocationMarker from './LocationMarker';

interface RouteMarkersProps {
  startLocation?: NamedCoords;
  endLocation?: NamedCoords;
  waypoints: NamedCoords[];
  locations: LocationPoint[];
}

const RouteMarkers: React.FC<RouteMarkersProps> = ({
  startLocation,
  endLocation,
  waypoints = [],
  locations = []
}) => {
  return (
    <>
      {startLocation && (
        <DepotMarker
          name={startLocation.name}
          position={startLocation.coords}
          isStart={true}
        />
      )}

      {endLocation && (
        <DepotMarker
          name={endLocation.name}
          position={endLocation.coords}
          isEnd={true}
        />
      )}

      {waypoints.map((wp, index) => (
        <LocationMarker
          key={`waypoint-${wp.name}-${index}`}
          id={`waypoint-${index}`}
          name={wp.name}
          position={wp.coords}
          index={index + 1}
          stopNumber={index + 1}
        />
      ))}

      {locations.map((loc, index) => {
        if (!loc.latitude || !loc.longitude) return null;
        return (
          <LocationMarker
            key={`location-${loc.id}-${index}`}
            id={loc.id}
            name={loc.name}
            position={[loc.latitude, loc.longitude]}
            address={loc.address}
            stopNumber={index + 1}
          />
        );
      })}
    </>
  );
};

export default RouteMarkers;
