
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createDepotIcon } from './Icons';
import type { Icon } from 'leaflet';

interface DepotMarkerProps {
  name: string;
  position: [number, number];
  isStart?: boolean;
  isEnd?: boolean;
}

const DepotMarker: React.FC<DepotMarkerProps> = ({ name, position, isStart, isEnd }) => {
  // Skip rendering if position contains NaN or zeros
  if (position.some(coord => isNaN(coord) || coord === 0)) {
    console.warn(`Skipping depot marker for ${name} due to invalid coordinates:`, position);
    return null;
  }
  
  const label = isStart ? 'S' : isEnd ? 'E' : 'D';
  
  // Create a custom icon and properly type it as Icon
  const customIcon = createDepotIcon({ label, isStart, isEnd }) as unknown as Icon;

  return (
    <Marker 
      position={position} 
      icon={customIcon}
    >
      <Popup>
        <div className="text-sm">
          <strong>{isStart ? 'Start: ' : isEnd ? 'End: ' : ''}{name}</strong>
        </div>
      </Popup>
    </Marker>
  );
};

export default DepotMarker;
