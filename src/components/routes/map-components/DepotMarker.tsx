
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createDepotIcon } from './Icons';
import L from 'leaflet';

interface DepotMarkerProps {
  name: string;
  position: [number, number];
  isStart?: boolean;
  isEnd?: boolean;
}

const DepotMarker: React.FC<DepotMarkerProps> = ({ name, position, isStart, isEnd }) => {
  if (position.some(coord => isNaN(coord) || coord === 0)) {
    console.warn(`Skipping depot marker for ${name} due to invalid coordinates:`, position);
    return null;
  }
  
  const label = isStart ? 'S' : isEnd ? 'E' : 'D';
  
  // Create a custom icon with proper typing
  const customIcon = createDepotIcon({ label, isStart, isEnd });
  
  // Cast the marker properties to match Leaflet's expected types
  const markerProps = {
    position,
    icon: customIcon
  } as unknown as L.MarkerOptions;
  
  return (
    <Marker {...markerProps}>
      <Popup>
        <div className="text-sm">
          <strong>{isStart ? 'Start: ' : isEnd ? 'End: ' : ''}{name}</strong>
        </div>
      </Popup>
    </Marker>
  );
};

export default DepotMarker;
