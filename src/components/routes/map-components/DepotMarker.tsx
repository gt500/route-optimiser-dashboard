
import React from 'react';
import { Marker, Popup } from 'react-leaflet';
import { createDepotIcon } from './Icons';

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
  
  // Create a custom icon - directly using the function that returns L.DivIcon
  const icon = createDepotIcon({ label, isStart, isEnd });

  return (
    <Marker 
      position={position} 
      icon={icon}
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
